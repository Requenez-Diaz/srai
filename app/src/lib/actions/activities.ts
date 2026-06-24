"use server";

import { redirect } from "next/navigation";
import db from "@/app/src/lib/db";
import { getCurrentUser } from "@/app/src/lib/auth";

export async function getActivities() {
  return db.activity.findMany({
    include: { location: true, organizer: true },
    orderBy: { startDate: "desc" },
  });
}

export async function getActivityById(id: string) {
  return db.activity.findUnique({
    where: { id },
    include: { location: true, organizer: true },
  });
}

export async function createActivity(_prev: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autorizado" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const startDate = formData.get("startDate") as string;
  const startTime = formData.get("startTime") as string;
  const endDate = formData.get("endDate") as string;
  const endTime = formData.get("endTime") as string;
  const locationId = formData.get("locationId") as string;

  if (!title || !startDate || !startTime || !endDate || !endTime || !locationId) {
    return { error: "Todos los campos obligatorios deben estar llenos" };
  }

  const start = new Date(`${startDate}T${startTime}:00`);
  const end = new Date(`${endDate}T${endTime}:00`);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { error: "Fechas inválidas" };
  }

  if (end <= start) {
    return { error: "La fecha de fin debe ser posterior a la de inicio" };
  }

  await db.activity.create({
    data: {
      title,
      description: description || null,
      startDate: start,
      endDate: end,
      locationId,
      organizerId: user.id,
    },
  });

  redirect("/dashboard/activities");
}
