"use client";

import { Button } from "@/app/src/components/ui/button";
import {
  registerMorningIn,
  registerMorningOut,
  registerAfternoonIn,
  registerAfternoonOut,
} from "@/app/src/lib/actions/attendance";

type Attendance = {
  morningIn: Date | null;
  morningOut: Date | null;
  afternoonIn: Date | null;
  afternoonOut: Date | null;
} | null;

export function AttendanceActions({ attendance }: { attendance: Attendance }) {
  const now = new Date();
  const hour = now.getHours();

  const canMorningIn = !attendance?.morningIn;
  const canMorningOut = !!attendance?.morningIn && !attendance?.morningOut;
  const canAfternoonIn = !attendance?.afternoonIn;
  const canAfternoonOut = !!attendance?.afternoonIn && !attendance?.afternoonOut;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <CardAction
          label="Entrada Mañana"
          time="8:00 AM"
          icon="🌅"
          action={registerMorningIn}
          disabled={!canMorningIn}
          done={!!attendance?.morningIn}
        />
        <CardAction
          label="Salida Mañana"
          time="12:00 PM"
          icon="🌅"
          action={registerMorningOut}
          disabled={!canMorningOut}
          done={!!attendance?.morningOut}
        />
        <CardAction
          label="Entrada Tarde"
          time="1:00 PM"
          icon="🌆"
          action={registerAfternoonIn}
          disabled={!canAfternoonIn}
          done={!!attendance?.afternoonIn}
        />
        <CardAction
          label="Salida Tarde"
          time="5:00 PM"
          icon="🌆"
          action={registerAfternoonOut}
          disabled={!canAfternoonOut}
          done={!!attendance?.afternoonOut}
        />
      </div>
    </div>
  );
}

function CardAction({
  label,
  time,
  icon,
  action,
  disabled,
  done,
}: {
  label: string;
  time: string;
  icon: string;
  action: () => Promise<void>;
  disabled: boolean;
  done: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
        done
          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
          : disabled
            ? "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/50"
            : "border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <div>
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{label}</p>
          <p className="text-xs text-zinc-400">{time}</p>
        </div>
      </div>
      {done ? (
        <span className="text-xs font-medium text-green-600 dark:text-green-400">Registrado</span>
      ) : (
        <form action={action}>
          <Button type="submit" size="sm" disabled={disabled}>
            Registrar
          </Button>
        </form>
      )}
    </div>
  );
}
