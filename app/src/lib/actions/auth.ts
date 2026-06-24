"use server";

import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import db from "@/app/src/lib/db";
import { hashPassword, verifyPassword, createSession, clearSession } from "@/app/src/lib/auth";

export async function login(_prev: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Todos los campos son obligatorios" };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) {
    return { error: "Credenciales inválidas" };
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return { error: "Credenciales inválidas" };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function register(_prev: unknown, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !password) {
    return { error: "Todos los campos son obligatorios" };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "El correo ya está registrado" };
  }

  const hashed = await hashPassword(password);
  const user = await db.user.create({
    data: { name, email, password: hashed, role: (role as Role) || Role.STUDENT },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
