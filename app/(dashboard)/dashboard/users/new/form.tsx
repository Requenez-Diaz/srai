"use client";

import { useActionState } from "react";
import { Input } from "@/app/src/components/ui/input";
import { Select } from "@/app/src/components/ui/select";
import { Button } from "@/app/src/components/ui/button";
import { createUser } from "@/app/src/lib/actions/auth";

export function CreateUserForm() {
  const [state, action, pending] = useActionState(createUser, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
          {state.error}
        </p>
      )}

      <Input label="Nombre" name="name" placeholder="Nombre completo" required />
      <Input label="Email" name="email" type="email" placeholder="correo@ejemplo.com" required />
      <Input label="Contraseña" name="password" type="password" placeholder="Mínimo 6 caracteres" required />

      <Select label="Rol" name="role" required>
        <option value="">Seleccionar rol</option>
        <option value="STUDENT">Estudiante</option>
        <option value="PRACTICANTE">Practicante</option>
        <option value="TEACHER">Docente</option>
        <option value="SUPPORT">Soporte</option>
        <option value="ADMIN">Administrador</option>
      </Select>

      <Input label="Facultad" name="faculty" placeholder="Opcional" />

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Creando..." : "Crear Usuario"}
        </Button>
        <Button type="reset" variant="secondary" onClick={() => window.history.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
