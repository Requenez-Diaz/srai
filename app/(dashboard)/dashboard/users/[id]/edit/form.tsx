"use client";

import { useActionState } from "react";
import { Input } from "@/app/src/components/ui/input";
import { Select } from "@/app/src/components/ui/select";
import { Button } from "@/app/src/components/ui/button";
import { updateUser } from "@/app/src/lib/actions/auth";

export function EditUserForm({
  userId,
  defaultName,
  defaultEmail,
  defaultRole,
  defaultFaculty,
}: {
  userId: string;
  defaultName: string;
  defaultEmail: string;
  defaultRole: string;
  defaultFaculty: string;
}) {
  const [state, action, pending] = useActionState(updateUser, undefined);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="userId" value={userId} />

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </p>
      )}

      <Input label="Nombre" name="name" defaultValue={defaultName} required />
      <Input label="Email" name="email" type="email" defaultValue={defaultEmail} required />
      <Input label="Contraseña (dejar vacío para no cambiar)" name="password" type="password" placeholder="Dejar vacío para mantener" />

      <Select label="Rol" name="role" defaultValue={defaultRole} required>
        <option value="STUDENT">Estudiante</option>
        <option value="PRACTICANTE">Practicante</option>
        <option value="TEACHER">Docente</option>
        <option value="SUPPORT">Soporte</option>
        <option value="ADMIN">Administrador</option>
      </Select>

      <Input label="Facultad" name="faculty" defaultValue={defaultFaculty} />

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
