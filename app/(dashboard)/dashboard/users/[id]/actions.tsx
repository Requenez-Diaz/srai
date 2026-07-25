"use client";

import { useState } from "react";
import { Button } from "@/app/src/components/ui/button";
import { deleteUser } from "@/app/src/lib/actions/auth";

export function DeleteUserButton({ userId }: { userId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <form action={deleteUser}>
          <input type="hidden" name="userId" value={userId} />
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
