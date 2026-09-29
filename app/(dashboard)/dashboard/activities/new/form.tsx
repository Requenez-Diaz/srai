"use client";

import { useActionState } from "react";
import { Input } from "@/app/src/components/ui/input";
import { Textarea } from "@/app/src/components/ui/textarea";
import { Select } from "@/app/src/components/ui/select";
import { Button } from "@/app/src/components/ui/button";
import { createActivity } from "@/app/src/lib/actions/activities";
import { ACTIVITY_TYPE_LABELS } from "@/app/src/lib/activity-types";

type Location = { id: string; building: string; room: string; floor: number };

export function CreateActivityForm({
  locations,
  buildings,
}: {
  locations: Location[];
  buildings: string[];
}) {
  const [state, action, pending] = useActionState(createActivity, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </p>
      )}

      <Input label="Título" name="title" placeholder="Ej: Taller de Robótica" required />

      <Textarea
        label="Descripción"
        name="description"
        placeholder="Describe la actividad, objetivos y detalles relevantes..."
        rows={4}
      />

      <Select label="Tipo de actividad" name="type" required defaultValue="OTRO">
        {Object.entries(ACTIVITY_TYPE_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Fecha de inicio" name="startDate" type="date" required />
        <Input label="Hora de inicio" name="startTime" type="time" required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Fecha de fin" name="endDate" type="date" required />
        <Input label="Hora de fin" name="endTime" type="time" required />
      </div>

      <Select label="Ubicación" name="locationId" required>
        <option value="">Seleccionar ubicación</option>
        {buildings.map((b) => {
          const buildingLocations = locations.filter((l) => l.building === b);
          return (
            <optgroup key={b} label={b}>
              {buildingLocations.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.room} (Piso {l.floor})
                </option>
              ))}
            </optgroup>
          );
        })}
      </Select>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Creando..." : "Crear Actividad"}
        </Button>
      </div>
    </form>
  );
}
