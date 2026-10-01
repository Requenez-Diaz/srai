"use server";

import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import db from "@/app/src/lib/db";
import {
  getCurrentUser,
  hashPassword,
  verifyPassword,
  createSession,
  clearSession,
} from "@/app/src/lib/auth";

/** Roles que puede封神arse alguien en el registro publico. */
const SELF_REGISTER_ROLES: Role[] = [Role.PRACTICANTE, Role.STUDENT, Role.TEACHER];

/** Roles sin privilegios: no ven datos de otros ni reportes. */
function isPrivileged(role: Role) {
  return role === Role.SUPPORT || role === Role.ADMIN;
}

/**
 * Las server actions son endpoints POST: la pagina puede proteger la vista,
 * pero la accion debe validar la sesion otra vez. Sin esto, cualquiera que
 * descubra el action podria crearse un ADMIN aunque el formulario no lo ofrezca.
 */
async function requirePrivileged() {
  const user = await getCurrentUser();
  if (!user || !isPrivileged(user.role)) redirect("/dashboard");
  return user;
}

function isValidRole(value: string): value is Role {
  return Object.values(Role).includes(value as Role);
}

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
  const requestedRole = (formData.get("role") as string) || Role.PRACTICANTE;

  if (!name || !email || !password) {
    return { error: "Todos los campos son obligatorios" };
  }

  // Sin esta lista, un POST con role=SUPPORT (o ADMIN) esquivaria el <select>.
  if (!isValidRole(requestedRole) || !SELF_REGISTER_ROLES.includes(requestedRole)) {
    return { error: "Ese rol no se puede asignar desde el registro público" };
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
    data: { name, email, password: hashed, role: requestedRole },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}

export async function getUsers() {
  await requirePrivileged();
  return db.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserById(id: string) {
  await requirePrivileged();
  return db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, faculty: true, createdAt: true },
  });
}

export async function createUser(_prev: unknown, formData: FormData) {
  await requirePrivileged();
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const faculty = formData.get("faculty") as string;

  if (!name || !email || !password || !role) {
    return { error: "Todos los campos obligatorios deben estar llenos" };
  }

  if (!isValidRole(role)) {
    return { error: "El rol seleccionado no es válido" };
  }

  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "El correo ya está registrado" };
  }

  const hashed = await hashPassword(password);
  await db.user.create({
    data: { name, email, password: hashed, role: role as Role, faculty: faculty || null },
  });

  redirect("/dashboard/users");
}

export async function updateUser(_prev: unknown, formData: FormData) {
  await requirePrivileged();
  const userId = formData.get("userId") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;
  const faculty = formData.get("faculty") as string;

  if (!userId || !name || !email || !role) {
    return { error: "Todos los campos obligatorios deben estar llenos" };
  }

  if (!isValidRole(role)) {
    return { error: "El rol seleccionado no es válido" };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing && existing.id !== userId) {
    return { error: "El correo ya está registrado por otro usuario" };
  }

  const data: { name: string; email: string; role: Role; faculty: string | null; password?: string } = {
    name,
    email,
    role: role as Role,
    faculty: faculty || null,
  };

  if (password && password.length > 0) {
    if (password.length < 6) {
      return { error: "La contraseña debe tener al menos 6 caracteres" };
    }
    data.password = await hashPassword(password);
  }

  await db.user.update({ where: { id: userId }, data });

  redirect("/dashboard/users");
}

export async function deleteUser(formData: FormData) {
  await requirePrivileged();
  const userId = formData.get("userId") as string;
  if (!userId) redirect("/dashboard/users");

  await db.user.delete({ where: { id: userId } });
  redirect("/dashboard/users");
}
