"use server";

import { ActivityType } from "@prisma/client";
import db from "@/app/src/lib/db";
import { getCurrentUser } from "@/app/src/lib/auth";
import {
  ACTIVITY_TYPE_LABELS,
  canAccessReports,
  resolvePeriod,
  type ResolvedPeriod,
} from "@/app/src/lib/activity-types";

export type CategoryTotal = {
  type: ActivityType;
  label: string;
  count: number;
  hours: number;
};

export type PersonTotal = {
  userId: string;
  name: string;
  role: string;
  faculty: string | null;
  counts: Record<string, number>;
  total: number;
  hours: number;
};

export type ActivityDetail = {
  id: string;
  title: string;
  type: ActivityType;
  typeLabel: string;
  startDate: Date;
  endDate: Date;
  hours: number;
  location: string;
  organizer: string;
};

export type ActivityReport = {
  period: ResolvedPeriod;
  generatedAt: Date;
  categories: ActivityType[];
  byCategory: CategoryTotal[];
  byPerson: PersonTotal[];
  details: ActivityDetail[];
  totals: {
    activities: number;
    hours: number;
    people: number;
  };
};

function hoursBetween(start: Date, end: Date) {
  return Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
}

export async function getActivityReport(input: {
  kind?: string;
  year?: string;
  period?: string;
}): Promise<ActivityReport | null> {
  const user = await getCurrentUser();
  if (!user || !canAccessReports(user.role)) return null;

  const period = resolvePeriod(input);

  const activities = await db.activity.findMany({
    where: {
      startDate: { gte: period.start, lt: period.end },
    },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          role: true,
          faculty: true,
        },
      },
      location: {
        select: {
          building: true,
          room: true,
        },
      },
    },
    orderBy: { startDate: "asc" },
  });

  const categories = Object.values(ActivityType);
  const categoryIndex = new Map<ActivityType, CategoryTotal>(
    categories.map((type) => [
      type,
      { type, label: ACTIVITY_TYPE_LABELS[type], count: 0, hours: 0 },
    ]),
  );

  const personIndex = new Map<string, PersonTotal>();

  const details: ActivityDetail[] = activities.map((activity) => {
    const hours = hoursBetween(activity.startDate, activity.endDate);
    const category = categoryIndex.get(activity.type);
    if (category) {
      category.count += 1;
      category.hours += hours;
    }

    let person = personIndex.get(activity.organizerId);
    if (!person) {
      person = {
        userId: activity.organizerId,
        name: activity.organizer.name,
        role: activity.organizer.role,
        faculty: activity.organizer.faculty,
        counts: Object.fromEntries(categories.map((type) => [type, 0])),
        total: 0,
        hours: 0,
      };
      personIndex.set(activity.organizerId, person);
    }
    person.counts[activity.type] = (person.counts[activity.type] ?? 0) + 1;
    person.total += 1;
    person.hours += hours;

    return {
      id: activity.id,
      title: activity.title,
      type: activity.type,
      typeLabel: ACTIVITY_TYPE_LABELS[activity.type],
      startDate: activity.startDate,
      endDate: activity.endDate,
      hours,
      location: `${activity.location.building} - ${activity.location.room}`,
      organizer: activity.organizer.name,
    };
  });

  const byPerson = [...personIndex.values()].sort(
    (a, b) => b.total - a.total || a.name.localeCompare(b.name),
  );

  const round = (value: number) => Math.round(value * 10) / 10;

  return {
    period,
    generatedAt: new Date(),
    categories,
    byCategory: [...categoryIndex.values()].map((entry) => ({
      ...entry,
      hours: round(entry.hours),
    })),
    byPerson: byPerson.map((entry) => ({ ...entry, hours: round(entry.hours) })),
    details,
    totals: {
      activities: activities.length,
      hours: round(
        activities.reduce(
          (acc, activity) => acc + hoursBetween(activity.startDate, activity.endDate),
          0,
        ),
      ),
      people: byPerson.length,
    },
  };
}
