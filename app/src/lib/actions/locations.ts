"use server";

import { revalidatePath } from "next/cache";
import db from "@/app/src/lib/db";
import { getCurrentUser } from "@/app/src/lib/auth";

export async function getLocations() {
  return db.location.findMany({ orderBy: [{ building: "asc" }, { room: "asc" }] });
}

export async function createLocation(_prev: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autorizado" };

  const building = (formData.get("building") as string)?.trim();
  const room = (formData.get("room") as string)?.trim();
  const floor = parseInt(formData.get("floor") as string);

  if (!building || !room || isNaN(floor)) {
    return { error: "Todos los campos son obligatorios" };
  }

  if (building.length > 100 || room.length > 100) {
    return { error: "El edificio y el aula son demasiado largos" };
  }

  if (!Number.isFinite(floor) || floor < -10 || floor > 200) {
    return { error: "El piso no es válido" };
  }

  const existing = await db.location.findUnique({
    where: { building_room: { building, room } },
  });

  if (existing) {
    return { error: "Ya existe esa ubicación" };
  }

  await db.location.create({ data: { building, room, floor } });
  revalidatePath("/dashboard/locations");
}
