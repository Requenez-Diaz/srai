"use client";

import { useState } from "react";
import { Button } from "@/app/src/components/ui/button";
import { deleteActivity } from "@/app/src/lib/actions/activities";

export function DeleteActivityButton({ activityId }: { activityId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <form action={deleteActivity}>
          <input type="hidden" name="id" value={activityId} />
          <Button type="submit" variant="danger" size="sm" className="w-full sm:w-auto">
            Confirmar
          </Button>
        </form>
        <Button variant="secondary" size="sm" onClick={() => setConfirming(false)} className="w-full sm:w-auto">
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="danger"
      size="sm"
      onClick={() => setConfirming(true)}
      className="w-full sm:w-auto"
    >
      Eliminar
    </Button>
  );
}
