"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import db from "@/app/src/lib/db";
import { getCurrentUser } from "@/app/src/lib/auth";

function canManageAll(role: string) {
  return role === "SUPPORT" || role === "ADMIN";
}

export async function getIssues() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const where = canManageAll(user.role) ? {} : { reportedById: user.id };

  return db.issue.findMany({
    where,
    include: { location: true, reportedBy: true, assignedTo: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getIssueById(id: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const issue = await db.issue.findUnique({
    where: { id },
    include: {
      location: true,
      reportedBy: true,
      assignedTo: true,
      history: {
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!issue) return null;

  if (!canManageAll(user.role) && issue.reportedById !== user.id) {
    return null;
  }

  return issue;
}

export async function createIssue(_prev: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autorizado" };

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const locationId = formData.get("locationId") as string;
  const priority = formData.get("priority") as string;

  if (!title || !locationId || !priority) {
    return { error: "Completa todos los campos obligatorios" };
  }

  const issue = await db.issue.create({
    data: {
      title,
      description: description || "",
      priority: priority as any,
      locationId,
      reportedById: user.id,
      history: {
        create: {
          previousStatus: "OPEN",
          newStatus: "OPEN",
          comment: "Incidencia reportada",
          userId: user.id,
        },
      },
    },
  });

  redirect(`/dashboard/issues/${issue.id}`);
}

export async function updateIssueStatus(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autorizado" };

  const issueId = formData.get("issueId") as string;
  const newStatus = formData.get("status") as string;
  const comment = formData.get("comment") as string;

  if (!issueId || !newStatus) {
    return { error: "Datos inválidos" };
  }

  const issue = await db.issue.findUnique({ where: { id: issueId } });
  if (!issue) return { error: "Incidencia no encontrada" };

  if (!canManageAll(user.role) && issue.reportedById !== user.id) {
    return { error: "No tienes permiso para modificar esta incidencia" };
  }

  await db.issue.update({
    where: { id: issueId },
    data: { status: newStatus as any },
  });

  await db.issueHistory.create({
    data: {
      previousStatus: issue.status,
      newStatus: newStatus as any,
      comment: comment || null,
      issueId,
      userId: user.id,
    },
  });

  revalidatePath(`/dashboard/issues/${issueId}`);
}

export async function assignIssue(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autorizado" };

  if (!canManageAll(user.role)) {
    return { error: "Solo soporte o admin pueden asignar incidencias" };
  }

  const issueId = formData.get("issueId") as string;
  const assignedToId = formData.get("assignedToId") as string;

  if (!issueId || !assignedToId) {
    return { error: "Datos inválidos" };
  }

  const assignedUser = await db.user.findUnique({ where: { id: assignedToId } });
  if (!assignedUser) return { error: "Usuario no encontrado" };

  await db.issue.update({
    where: { id: issueId },
    data: { assignedToId },
  });

  await db.issueHistory.create({
    data: {
      previousStatus: "OPEN",
      newStatus: "IN_PROGRESS",
      comment: `Asignado a ${assignedUser.name}`,
      issueId,
      userId: user.id,
    },
  });

  if (!canManageAll(user.role)) {
    await db.issue.update({
      where: { id: issueId },
      data: { status: "IN_PROGRESS" },
    });
  }

  revalidatePath(`/dashboard/issues/${issueId}`);
}

export async function updateIssue(_prev: unknown, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { error: "No autorizado" };

  const issueId = formData.get("issueId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const locationId = formData.get("locationId") as string;
  const priority = formData.get("priority") as string;

  if (!issueId || !title || !locationId || !priority) {
    return { error: "Completa todos los campos obligatorios" };
  }

  const issue = await db.issue.findUnique({ where: { id: issueId } });
  if (!issue) return { error: "Incidencia no encontrada" };

  if (!canManageAll(user.role) && issue.reportedById !== user.id) {
    return { error: "No tienes permiso para editar esta incidencia" };
  }

  await db.issue.update({
    where: { id: issueId },
    data: { title, description: description || "", locationId, priority: priority as any },
  });

  await db.issueHistory.create({
    data: {
      previousStatus: "OPEN",
      newStatus: "OPEN",
      comment: "Incidencia editada",
      issueId,
      userId: user.id,
    },
  });

  revalidatePath(`/dashboard/issues/${issueId}`);
  redirect(`/dashboard/issues/${issueId}`);
}

export async function deleteIssue(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const issueId = formData.get("issueId") as string;
  if (!issueId) redirect("/dashboard/issues");

  const issue = await db.issue.findUnique({ where: { id: issueId } });
  if (!issue) redirect("/dashboard/issues");

  if (!canManageAll(user.role) && issue.reportedById !== user.id) {
    redirect("/dashboard/issues");
  }

  await db.issue.delete({ where: { id: issueId } });
  redirect("/dashboard/issues");
}

export async function getSupportUsers() {
  return db.user.findMany({
    where: { role: { in: ["SUPPORT", "ADMIN"] } },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function getCurrentUserRole() {
  const user = await getCurrentUser();
  return user?.role ?? null;
}
