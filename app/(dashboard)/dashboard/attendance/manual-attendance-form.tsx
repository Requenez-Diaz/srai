"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/app/src/components/ui/button";
import { Input } from "@/app/src/components/ui/input";
import { Select } from "@/app/src/components/ui/select";
import {
  addManualAttendance,
  updateManualAttendance,
  type AttendanceFormState,
} from "@/app/src/lib/actions/attendance";
import { dateKeyOf, timeValueOf } from "@/app/src/lib/attendance-manual";

export type EditableAttendance = {
  id: string;
  userId: string;
  date: Date;
  morningIn: Date | null;
  morningOut: Date | null;
  afternoonIn: Date | null;
  afternoonOut: Date | null;
};

type Props = {
  users: { id: string; name: string; role: string }[];
  canPickUser: boolean;
  todayKey: string;
  record?: EditableAttendance | null;
  onDone?: () => void;
};

export function ManualAttendanceForm({
  users,
  canPickUser,
  todayKey,
  record,
  onDone,
}: Props) {
  const isEdit = Boolean(record);
  const [state, action, pending] = useActionState<AttendanceFormState, FormData>(
    isEdit ? updateManualAttendance : addManualAttendance,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) onDone?.();
  }, [state, onDone]);

  const shiftNames = {
    morningIn: "Entrada mañana",
    morningOut: "Salida mañana",
    afternoonIn: "Entrada tarde",
    afternoonOut: "Salida tarde",
  } as const;

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </p>
      )}

      {record && <input type="hidden" name="recordId" value={record.id} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Fecha"
          name="date"
          type="date"
          defaultValue={record ? dateKeyOf(record.date) : ""}
          max={todayKey}
          required
        />

        {canPickUser && (
          <Select
            label="Practicante"
            name="userId"
            defaultValue={record ? record.userId : users[0]?.id}
            required
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <ShiftFields
          title="Turno de la mañana"
          names={{ in: "morningIn", out: "morningOut" }}
          labels={{ in: shiftNames.morningIn, out: shiftNames.morningOut }}
          record={record}
        />
        <ShiftFields
          title="Turno de la tarde"
          names={{ in: "afternoonIn", out: "afternoonOut" }}
          labels={{ in: shiftNames.afternoonIn, out: shiftNames.afternoonOut }}
          record={record}
        />
      </div>

      <p className="text-xs text-zinc-500">
        Deja un turno completamente vacío si ese día solo trabajaste en el otro.
      </p>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : isEdit ? "Guardar cambios" : "Agregar horas"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => onDone?.()} disabled={pending}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}

type ShiftKey = "morningIn" | "morningOut" | "afternoonIn" | "afternoonOut";

function ShiftFields({
  title,
  names,
  labels,
  record,
}: {
  title: string;
  names: { in: ShiftKey; out: ShiftKey };
  labels: { in: string; out: string };
  record?: EditableAttendance | null;
}) {
  return (
    <fieldset className="min-w-0 space-y-3 rounded-lg border border-zinc-200 p-3 dark:border-zinc-700">
      <legend className="px-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        {title}
      </legend>
      <Input
        label={labels.in}
        name={names.in}
        type="time"
        defaultValue={timeValueOf(record?.[names.in] ?? null)}
      />
      <Input
        label={labels.out}
        name={names.out}
        type="time"
        defaultValue={timeValueOf(record?.[names.out] ?? null)}
      />
    </fieldset>
  );
}