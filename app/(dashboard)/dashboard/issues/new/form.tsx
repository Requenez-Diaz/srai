"use client";

import { useActionState } from "react";
import { Input } from "@/app/src/components/ui/input";
import { Textarea } from "@/app/src/components/ui/textarea";
import { Select } from "@/app/src/components/ui/select";
import { Button } from "@/app/src/components/ui/button";
import { createIssue } from "@/app/src/lib/actions/issues";

type Location = { id: string; building: string; room: string; floor: number };

export function CreateIssueForm({
  locations,
  buildings,
}: {
  locations: Location[];
  buildings: string[];
}) {
  const [state, action, pending] = useActionState(createIssue, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </p>
      )}

      <Input label="Título" name="title" placeholder="Ej: Proyector dañado en Aula 101" required />

      <Textarea
        label="Descripción"
        name="description"
        placeholder="Describe el problema con el mayor detalle posible..."
        rows={4}
      />

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

      <Select label="Prioridad" name="priority" required>
        <option value="">Seleccionar prioridad</option>
        <option value="LOW">Baja</option>
        <option value="MEDIUM">Media</option>
        <option value="HIGH">Alta</option>
        <option value="CRITICAL">Crítica</option>
      </Select>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Enviando..." : "Enviar Reporte"}
        </Button>
      </div>
    </form>
  );
}
