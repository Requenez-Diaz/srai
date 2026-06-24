"use client";

import { useActionState } from "react";
import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { Input } from "@/app/src/components/ui/input";
import { Select } from "@/app/src/components/ui/select";
import { Button } from "@/app/src/components/ui/button";
import Link from "next/link";
import { register } from "@/app/src/lib/actions/auth";

export default function RegisterPage() {
  const [state, action, pending] = useActionState(register, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Crear Cuenta</CardTitle>
        <p className="mt-1 text-center text-sm text-zinc-500">
          Regístrate para acceder al sistema SRAI
        </p>
      </CardHeader>
      <form action={action} className="space-y-4">
        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {state.error}
          </p>
        )}
        <Input label="Nombre completo" name="name" placeholder="Ej: Juan Pérez" required />
        <Input label="Correo electrónico" name="email" type="email" placeholder="correo@ejemplo.com" required />
        <Input label="Contraseña" name="password" type="password" placeholder="Mínimo 6 caracteres" required minLength={6} />
        <Select label="Rol" name="role">
          <option value="STUDENT">Estudiante</option>
          <option value="TEACHER">Docente</option>
          <option value="SUPPORT">Soporte</option>
        </Select>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creando cuenta..." : "Crear Cuenta"}
        </Button>
        <p className="text-center text-sm text-zinc-500">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
            Iniciar Sesión
          </Link>
        </p>
      </form>
    </Card>
  );
}
