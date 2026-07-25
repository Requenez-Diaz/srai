"use client";

import { useState } from "react";
import { Button } from "@/app/src/components/ui/button";
import { deleteUser } from "@/app/src/lib/actions/auth";

export function DeleteUserButton({ userId, currentUserId }: { userId: string; currentUserId: string }) {
  const [confirming, setConfirming] = useState(false);

  if (userId === currentUserId) return null;

  if (confirming) {
    return (
      <div className="flex items-center gap-1">
        <form action={deleteUser}>
          <input type="hidden" name="userId" value={userId} />
          <Button type="submit" variant="danger" size="sm">
            Sí
          </Button>
        </form>
        <Button variant="secondary" size="sm" onClick={() => setConfirming(false)}>
          No
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
