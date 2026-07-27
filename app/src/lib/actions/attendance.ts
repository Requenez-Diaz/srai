"use server";

import { revalidatePath } from "next/cache";
import db from "@/app/src/lib/db";
import { getCurrentUser } from "@/app/src/lib/auth";

function isToday(date: Date) {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export async function getTodayAttendance() {
  const user = await getCurrentUser();
  if (!user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return db.attendance.findUnique({
    where: { userId_date: { userId: user.id, date: today } },
  });
}

export async function registerMorningIn() {
  const user = await getCurrentUser();
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await db.attendance.upsert({
    where: { userId_date: { userId: user.id, date: today } },
    update: { morningIn: new Date() },
    create: { userId: user.id, date: today, morningIn: new Date() },
  });

  revalidatePath("/dashboard/attendance");
}

export async function registerMorningOut() {
  const user = await getCurrentUser();
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await db.attendance.findUnique({
    where: { userId_date: { userId: user.id, date: today } },
  });

  if (!existing || !existing.morningIn) return;

  await db.attendance.update({
    where: { userId_date: { userId: user.id, date: today } },
    data: { morningOut: new Date() },
  });

  revalidatePath("/dashboard/attendance");
}

export async function registerAfternoonIn() {
  const user = await getCurrentUser();
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await db.attendance.upsert({
    where: { userId_date: { userId: user.id, date: today } },
    update: { afternoonIn: new Date() },
    create: { userId: user.id, date: today, afternoonIn: new Date() },
  });

  revalidatePath("/dashboard/attendance");
}

export async function registerAfternoonOut() {
  const user = await getCurrentUser();
  if (!user) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await db.attendance.findUnique({
    where: { userId_date: { userId: user.id, date: today } },
  });

  if (!existing || !existing.afternoonIn) return;

  await db.attendance.update({
    where: { userId_date: { userId: user.id, date: today } },
    data: { afternoonOut: new Date() },
  });

  revalidatePath("/dashboard/attendance");
}

export async function getAllAttendance() {
  const user = await getCurrentUser();
  if (!user) return [];

  if (user.role === "SUPPORT" || user.role === "ADMIN") {
    return db.attendance.findMany({
      include: { user: { select: { id: true, name: true, email: true, role: true } } },
      orderBy: { date: "desc" },
    });
  }

  return db.attendance.findMany({
    where: { userId: user.id },
    include: { user: { select: { id: true, name: true, email: true, role: true } } },
    orderBy: { date: "desc" },
  });
}

const PAGE_SIZE = 10;

export async function getAttendanceByUser(userId: string, page: number = 1) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPPORT" && user.role !== "ADMIN")) {
    return { records: [], totalPages: 0, page: 1, user: null };
  }

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!targetUser) return { records: [], totalPages: 0, page: 1, user: null };

  const skip = (page - 1) * PAGE_SIZE;

  const [records, total] = await Promise.all([
    db.attendance.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    db.attendance.count({ where: { userId } }),
  ]);

  return {
    records,
    totalPages: Math.ceil(total / PAGE_SIZE),
    page,
    user: targetUser,
  };
}

export async function getAllAttendanceByUser(userId: string) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPPORT" && user.role !== "ADMIN")) {
    return { records: [], user: null };
  }

  const targetUser = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!targetUser) return { records: [], user: null };

  const records = await db.attendance.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  return { records, user: targetUser };
}
