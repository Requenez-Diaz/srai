"use server";

import { revalidatePath } from "next/cache";
import db from "@/app/src/lib/db";
import { getCurrentUser } from "@/app/src/lib/auth";
import { getTodayDbDate, formatDbDate } from "@/app/src/lib/date-format";
import {
  canManageAttendance,
  canPickOtherUsers,
  parseManualAttendance,
  toDbDate,
} from "@/app/src/lib/attendance-manual";

export async function getTodayAttendance() {
  const user = await getCurrentUser();

  if (!user) return null;

  const today = getTodayDbDate();

  return db.attendance.findUnique({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
  });
}

export async function registerMorningIn() {
  const user = await getCurrentUser();

  if (!user) return;

  const today = getTodayDbDate();

  await db.attendance.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
    update: {
      morningIn: new Date(),
    },
    create: {
      userId: user.id,
      date: today,
      morningIn: new Date(),
    },
  });

  revalidatePath("/dashboard/attendance");
}

export async function registerMorningOut() {
  const user = await getCurrentUser();

  if (!user) return;

  const today = getTodayDbDate();

  const existing = await db.attendance.findUnique({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
  });

  if (!existing || !existing.morningIn) return;

  await db.attendance.update({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
    data: {
      morningOut: new Date(),
    },
  });

  revalidatePath("/dashboard/attendance");
}

export async function registerAfternoonIn() {
  const user = await getCurrentUser();

  if (!user) return;

  const today = getTodayDbDate();

  await db.attendance.upsert({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
    update: {
      afternoonIn: new Date(),
    },
    create: {
      userId: user.id,
      date: today,
      afternoonIn: new Date(),
    },
  });

  revalidatePath("/dashboard/attendance");
}

export async function registerAfternoonOut() {
  const user = await getCurrentUser();

  if (!user) return;

  const today = getTodayDbDate();

  const existing = await db.attendance.findUnique({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
  });

  if (!existing || !existing.afternoonIn) return;

  await db.attendance.update({
    where: {
      userId_date: {
        userId: user.id,
        date: today,
      },
    },
    data: {
      afternoonOut: new Date(),
    },
  });

  revalidatePath("/dashboard/attendance");
}

export async function getAllAttendance() {
  const user = await getCurrentUser();

  if (!user) return [];

  if (user.role === "SUPPORT" || user.role === "ADMIN") {
    return db.attendance.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    });
  }

  return db.attendance.findMany({
    where: {
      userId: user.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });
}

const PAGE_SIZE = 10;

export async function getAttendanceByUser(userId: string, page: number = 1) {
  const user = await getCurrentUser();

  if (!user || (user.role !== "SUPPORT" && user.role !== "ADMIN")) {
    return {
      records: [],
      totalPages: 0,
      page: 1,
      user: null,
    };
  }

  const targetUser = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!targetUser) {
    return {
      records: [],
      totalPages: 0,
      page: 1,
      user: null,
    };
  }

  const skip = (page - 1) * PAGE_SIZE;

  const [records, total] = await Promise.all([
    db.attendance.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: "desc",
      },
      skip,
      take: PAGE_SIZE,
    }),

    db.attendance.count({
      where: {
        userId,
      },
    }),
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
    return {
      records: [],
      user: null,
    };
  }

  const targetUser = await db.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  if (!targetUser) {
    return {
      records: [],
      user: null,
    };
  }

  const records = await db.attendance.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: "desc",
    },
  });

  return {
    records,
    user: targetUser,
  };
}

export type AttendanceFormState = { ok?: true; error?: string } | undefined;

function revalidateAttendanceViews() {
  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/attendance/history");
}

export async function addManualAttendance(
  _prev: AttendanceFormState,
  formData: FormData,
): Promise<AttendanceFormState> {
  const user = await getCurrentUser();

  if (!user) return { error: "Sesión expirada. Vuelve a iniciar sesión." };

  const parsed = parseManualAttendance(formData, user.id);

  if (!parsed.ok) return { error: parsed.error };

  const { userId, dateKey, ...times } = parsed.value;

  if (!canManageAttendance(user, userId)) {
    return { error: "No puedes registrar horas a nombre de otra persona." };
  }

  const target = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!target) return { error: "El practicante indicado no existe." };

  const date = toDbDate(dateKey);
  const existing = await db.attendance.findUnique({
    where: { userId_date: { userId, date } },
  });

  if (existing) {
    const label = formatDbDate(date);
    return {
      error: `Ya existe un registro para el ${label}. Edítalo desde el historial en lugar de agregar otro.`,
    };
  }

  await db.attendance.create({
    data: { userId, date, ...times, isManual: true },
  });

  revalidateAttendanceViews();
  return { ok: true };
}

export async function updateManualAttendance(
  _prev: AttendanceFormState,
  formData: FormData,
): Promise<AttendanceFormState> {
  const user = await getCurrentUser();

  if (!user) return { error: "Sesión expirada. Vuelve a iniciar sesión." };

  const recordId = String(formData.get("recordId") ?? "").trim();
  if (!recordId) return { error: "Falta el identificador del registro." };

  const record = await db.attendance.findUnique({ where: { id: recordId } });

  if (!record) return { error: "El registro ya no existe." };

  if (!canManageAttendance(user, record.userId)) {
    return { error: "No tienes permiso para modificar este registro." };
  }

  const parsed = parseManualAttendance(formData, record.userId);

  if (!parsed.ok) return { error: parsed.error };

  const { userId, dateKey, ...times } = parsed.value;

  if (userId !== record.userId) {
    return { error: "No se puede mover un registro a otro practicante." };
  }

  const date = toDbDate(dateKey);
  const clash = await db.attendance.findUnique({
    where: { userId_date: { userId, date } },
  });

  if (clash && clash.id !== record.id) {
    return {
      error: `Ya existe otro registro para el ${formatDbDate(date)}. Elige una fecha libre.`,
    };
  }

  await db.attendance.update({
    where: { id: record.id },
    data: { date, ...times, isManual: true },
  });

  revalidateAttendanceViews();
  return { ok: true };
}

export async function deleteAttendanceRecord(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) return;

  const recordId = String(formData.get("recordId") ?? "").trim();
  if (!recordId) return;

  const record = await db.attendance.findUnique({ where: { id: recordId } });

  if (!record) return;

  if (!canManageAttendance(user, record.userId)) return;

  await db.attendance.delete({ where: { id: record.id } });

  revalidateAttendanceViews();
}

export async function getAttendanceUsers() {
  const user = await getCurrentUser();

  if (!user || !canPickOtherUsers(user.role)) return [];

  return db.user.findMany({
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });
}
