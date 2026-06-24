"use client";

import { useActionState } from "react";
import { Input } from "@/app/src/components/ui/input";
import { Textarea } from "@/app/src/components/ui/textarea";
import { Select } from "@/app/src/components/ui/select";
import { Button } from "@/app/src/components/ui/button";
import { updateIssue } from "@/app/src/lib/actions/issues";

type Location = { id: string; building: string; room: string; floor: number };

export function EditIssueForm({
  issueId,
  defaultTitle,
  defaultDescription,
  defaultLocationId,
  defaultPriority,
  locations,
  buildings,
}: {
  issueId: string;
  defaultTitle: string;
  defaultDescription: string;
  defaultLocationId: string;
  defaultPriority: string;
  locations: Location[];
  buildings: string[];
}) {
  const [state, action, pending] = useActionState(updateIssue, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="issueId" value={issueId} />

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </p>
      )}

      <Input
        label="Título"
        name="title"
        defaultValue={defaultTitle}
        required
      />

      <Textarea
        label="Descripción"
        name="description"
        defaultValue={defaultDescription}
        rows={4}
      />

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

      <Select label="Prioridad" name="priority" defaultValue={defaultPriority} required>
        <option value="LOW">Baja</option>
        <option value="MEDIUM">Media</option>
        <option value="HIGH">Alta</option>
        <option value="CRITICAL">Crítica</option>
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
