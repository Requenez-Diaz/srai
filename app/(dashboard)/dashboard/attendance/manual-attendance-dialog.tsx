"use client";

import { useState } from "react";
import { Button } from "@/app/src/components/ui/button";
import {
  ManualAttendanceForm,
  type EditableAttendance,
} from "./manual-attendance-form";

type Props = {
  users: { id: string; name: string; role: string }[];
  canPickUser: boolean;
  todayKey: string;
  record?: EditableAttendance | null;
  triggerLabel?: string;
  triggerVariant?: "primary" | "secondary" | "danger";
  onOpenChange?: (open: boolean) => void;
};

export function ManualAttendanceDialog({
  users,
  canPickUser,
  todayKey,
  record,
  triggerLabel = "+ Agregar horas anteriores",
  triggerVariant = "secondary",
  onOpenChange,
}: Props) {
  const [open, setOpen] = useState(false);

  const close = () => {
    setOpen(false);
    onOpenChange?.(false);
  };

  return (
    <>
      <Button
        type="button"
        variant={triggerVariant}
        size={triggerVariant === "danger" ? "sm" : "md"}
        onClick={() => {
          setOpen(true);
          onOpenChange?.(true);
        }}
        className={triggerVariant === "danger" ? "w-full sm:w-auto" : undefined}
      >
        {triggerLabel}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <div className="fixed inset-0 bg-black/50" onClick={close} />
          <div className="relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-xl bg-white shadow-xl sm:max-h-[85vh] sm:rounded-xl dark:bg-zinc-900">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-zinc-200 px-4 py-4 sm:px-6 dark:border-zinc-700">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-50">
                  {record ? "Editar registro" : "Agregar horas anteriores"}
                </h3>
                <p className="text-sm text-zinc-500">
                  {record
                    ? "Corrige la fecha o los horarios de este día."
                    : "Registra las horas que llevabas en tu cuaderno antes de usar el sistema."}
                </p>
              </div>
              <button
                onClick={close}
                aria-label="Cerrar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-4 sm:p-6">
              <ManualAttendanceForm
                key={record?.id ?? "nuevo"}
                users={users}
                canPickUser={canPickUser}
                todayKey={todayKey}
                record={record}
                onDone={close}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}