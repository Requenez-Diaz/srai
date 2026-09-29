"use server";

import { ActivityType, IssueStatus, Priority } from "@prisma/client";
import db from "@/app/src/lib/db";
import { getCurrentUser } from "@/app/src/lib/auth";
import {
  ACTIVITY_TYPE_LABELS,
  ISSUE_PRIORITY_LABELS,
  ISSUE_STATUS_LABELS,
  canAccessReports,
  resolvePeriod,
  type ResolvedPeriod,
} from "@/app/src/lib/activity-types";

export type CategoryTotal = {
  type: ActivityType;
  label: string;
  count: number;
  hours: number;
  titles: string[];
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
      { type, label: ACTIVITY_TYPE_LABELS[type], count: 0, hours: 0, titles: [] },
    ]),
  );

  const personIndex = new Map<string, PersonTotal>();

  const details: ActivityDetail[] = activities.map((activity) => {
    const hours = hoursBetween(activity.startDate, activity.endDate);
    const category = categoryIndex.get(activity.type);
    if (category) {
      category.count += 1;
      category.hours += hours;
      category.titles.push(activity.title);
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

export type IssueCategoryTotal = {
  key: string;
  label: string;
  count: number;
  titles: string[];
};

export type IssuePersonTotal = {
  userId: string;
  name: string;
  role: string;
  faculty: string | null;
  counts: Record<string, number>;
  total: number;
};

export type IssueDetail = {
  id: string;
  title: string;
  status: IssueStatus;
  statusLabel: string;
  priority: Priority;
  priorityLabel: string;
  createdAt: Date;
  location: string;
  reportedBy: string;
  assignedTo: string | null;
};

export type IssueReport = {
  period: ResolvedPeriod;
  generatedAt: Date;
  statuses: IssueStatus[];
  priorities: Priority[];
  byStatus: IssueCategoryTotal[];
  byPriority: IssueCategoryTotal[];
  byPersonStatus: IssuePersonTotal[];
  byPersonPriority: IssuePersonTotal[];
  details: IssueDetail[];
  totals: {
    issues: number;
    people: number;
    pending: number;
    resolved: number;
  };
};

export async function getIssueReport(input: {
  kind?: string;
  year?: string;
  period?: string;
}): Promise<IssueReport | null> {
  const user = await getCurrentUser();
  if (!user || !canAccessReports(user.role)) return null;

  const period = resolvePeriod(input);

  const issues = await db.issue.findMany({
    where: {
      createdAt: { gte: period.start, lt: period.end },
    },
    include: {
      reportedBy: { select: { id: true, name: true, role: true, faculty: true } },
      assignedTo: { select: { name: true } },
      location: { select: { building: true, room: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const statuses = Object.values(IssueStatus);
  const priorities = Object.values(Priority);

  const statusIndex = new Map<IssueStatus, IssueCategoryTotal>(
    statuses.map((status) => [
      status,
      { key: status, label: ISSUE_STATUS_LABELS[status], count: 0, titles: [] },
    ]),
  );

  const priorityIndex = new Map<Priority, IssueCategoryTotal>(
    priorities.map((priority) => [
      priority,
      {
        key: priority,
        label: ISSUE_PRIORITY_LABELS[priority],
        count: 0,
        titles: [],
      },
    ]),
  );

  const personStatusIndex = new Map<string, IssuePersonTotal>();
  const personPriorityIndex = new Map<string, IssuePersonTotal>();

  const details: IssueDetail[] = issues.map((issue) => {
    const statusEntry = statusIndex.get(issue.status);
    if (statusEntry) {
      statusEntry.count += 1;
      statusEntry.titles.push(issue.title);
    }

    const priorityEntry = priorityIndex.get(issue.priority);
    if (priorityEntry) {
      priorityEntry.count += 1;
      priorityEntry.titles.push(issue.title);
    }

    for (const [index, key] of [
      [personStatusIndex, issue.status],
      [personPriorityIndex, issue.priority],
    ] as const) {
      let person = index.get(issue.reportedById);
      if (!person) {
        person = {
          userId: issue.reportedById,
          name: issue.reportedBy.name,
          role: issue.reportedBy.role,
          faculty: issue.reportedBy.faculty,
          counts: {},
          total: 0,
        };
        index.set(issue.reportedById, person);
      }
      person.counts[key] = (person.counts[key] ?? 0) + 1;
      person.total += 1;
    }

    return {
      id: issue.id,
      title: issue.title,
      status: issue.status,
      statusLabel: ISSUE_STATUS_LABELS[issue.status],
      priority: issue.priority,
      priorityLabel: ISSUE_PRIORITY_LABELS[issue.priority],
      createdAt: issue.createdAt,
      location: `${issue.location.building} - ${issue.location.room}`,
      reportedBy: issue.reportedBy.name,
      assignedTo: issue.assignedTo?.name ?? null,
    };
  });

  const sortPeople = (list: Map<string, IssuePersonTotal>) =>
    [...list.values()].sort((a, b) => b.total - a.total || a.name.localeCompare(b.name));

  return {
    period,
    generatedAt: new Date(),
    statuses,
    priorities,
    byStatus: [...statusIndex.values()],
    byPriority: [...priorityIndex.values()],
    byPersonStatus: sortPeople(personStatusIndex),
    byPersonPriority: sortPeople(personPriorityIndex),
    details,
    totals: {
      issues: issues.length,
      people: personStatusIndex.size,
      pending: issues.filter(
        (issue) => issue.status === IssueStatus.OPEN || issue.status === IssueStatus.IN_PROGRESS,
      ).length,
      resolved: issues.filter(
        (issue) => issue.status === IssueStatus.RESOLVED || issue.status === IssueStatus.REJECTED,
      ).length,
    },
  };
}
