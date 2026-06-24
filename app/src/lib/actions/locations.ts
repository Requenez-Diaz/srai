"use server";

import { revalidatePath } from "next/cache";
import db from "@/app/src/lib/db";

export async function getLocations() {
  return db.location.findMany({ orderBy: [{ building: "asc" }, { room: "asc" }] });
}

export async function createLocation(_prev: unknown, formData: FormData) {
  const building = formData.get("building") as string;
  const room = formData.get("room") as string;
  const floor = parseInt(formData.get("floor") as string);

  if (!building || !room || isNaN(floor)) {
    return { error: "Todos los campos son obligatorios" };
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
