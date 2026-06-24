"use client";

import { useActionState } from "react";
import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { Input } from "@/app/src/components/ui/input";
import { Button } from "@/app/src/components/ui/button";
import Link from "next/link";
import { login } from "@/app/src/lib/actions/auth";

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Iniciar Sesión</CardTitle>
        <p className="mt-1 text-center text-sm text-zinc-500">
          Ingresa tus credenciales para acceder al sistema
        </p>
      </CardHeader>
      <form action={action} className="space-y-4">
        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {state.error}
          </p>
        )}
        <Input label="Correo electrónico" name="email" type="email" placeholder="correo@ejemplo.com" required />
        <Input label="Contraseña" name="password" type="password" placeholder="••••••••" required />
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Ingresando..." : "Ingresar"}
        </Button>
        <p className="text-center text-sm text-zinc-500">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
            Registrarse
          </Link>
        </p>
      </form>
    </Card>
  );
}
