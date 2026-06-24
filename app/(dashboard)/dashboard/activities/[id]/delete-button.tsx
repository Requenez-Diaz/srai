"use client";

import { useState } from "react";
import { Button } from "@/app/src/components/ui/button";
import { deleteActivity } from "@/app/src/lib/actions/activities";

export function DeleteActivityButton({ activityId }: { activityId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <form action={deleteActivity}>
          <input type="hidden" name="id" value={activityId} />
          <Button type="submit" variant="danger" size="sm">
            Confirmar
          </Button>
        </form>
        <Button variant="secondary" size="sm" onClick={() => setConfirming(false)}>
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <Button variant="danger" size="sm" onClick={() => setConfirming(true)}>
      Eliminar
    </Button>
  );
}
