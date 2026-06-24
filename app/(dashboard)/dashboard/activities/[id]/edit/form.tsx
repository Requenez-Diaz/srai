"use client";

import { useActionState } from "react";
import { Input } from "@/app/src/components/ui/input";
import { Textarea } from "@/app/src/components/ui/textarea";
import { Select } from "@/app/src/components/ui/select";
import { Button } from "@/app/src/components/ui/button";
import { updateActivity } from "@/app/src/lib/actions/activities";

type Location = { id: string; building: string; room: string; floor: number };

export function EditActivityForm({
  activityId,
  defaultTitle,
  defaultDescription,
  defaultStartDate,
  defaultStartTime,
  defaultEndDate,
  defaultEndTime,
  defaultLocationId,
  locations,
  buildings,
}: {
  activityId: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultStartDate: string;
  defaultStartTime: string;
  defaultEndDate: string;
  defaultEndTime: string;
  defaultLocationId: string;
  locations: Location[];
  buildings: string[];
}) {
  const [state, action, pending] = useActionState(updateActivity, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="id" value={activityId} />

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </p>
      )}

      <Input label="Título" name="title" defaultValue={defaultTitle} required />

      <Textarea
        label="Descripción"
        name="description"
        defaultValue={defaultDescription}
        rows={4}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Fecha de inicio" name="startDate" type="date" defaultValue={defaultStartDate} required />
        <Input label="Hora de inicio" name="startTime" type="time" defaultValue={defaultStartTime} required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Fecha de fin" name="endDate" type="date" defaultValue={defaultEndDate} required />
        <Input label="Hora de fin" name="endTime" type="time" defaultValue={defaultEndTime} required />
      </div>

      <Select label="Ubicación" name="locationId" defaultValue={defaultLocationId} required>
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
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Guardar Cambios"}
        </Button>
        <Button type="reset" variant="secondary" onClick={() => window.history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
