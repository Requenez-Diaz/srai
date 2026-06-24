"use client";

import { useState, useActionState } from "react";
import { Input } from "@/app/src/components/ui/input";
import { Button } from "@/app/src/components/ui/button";
import { createLocation } from "@/app/src/lib/actions/locations";

export function CreateLocationForm() {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(
    async (prev: unknown, formData: FormData) => {
      const result = await createLocation(prev, formData);
      if (!result?.error) setOpen(false);
      return result;
    },
    undefined,
  );

  return (
    <>
      <Button type="button" onClick={() => setOpen(!open)}>
        {open ? "Cancelar" : "Agregar Ubicación"}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg dark:bg-zinc-900">
            <h3 className="mb-4 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
              Nueva Ubicación
            </h3>
            <form action={action} className="space-y-4">
              {state?.error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  {state.error}
                </p>
              )}
              <Input name="building" label="Edificio" placeholder="Ej: Edificio A" required />
              <Input name="room" label="Aula / Sala" placeholder="Ej: 101" required />
              <Input name="floor" label="Piso" type="number" placeholder="1" required min={0} />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
