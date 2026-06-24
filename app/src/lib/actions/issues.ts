"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import db from "@/app/src/lib/db";
import { getCurrentUser } from "@/app/src/lib/auth";

export async function getIssues() {
  return db.issue.findMany({
    include: { location: true, reportedBy: true, assignedTo: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function getIssueById(id: string) {
  return db.issue.findUnique({
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

  if (user.role !== "ADMIN" && user.role !== "SUPPORT") {
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

  await db.issue.delete({ where: { id: issueId } });
  redirect("/dashboard/issues");
}

export async function getSupportUsers() {
  return db.user.findMany({
    where: { role: { in: ["SUPPORT", "ADMIN"] } },
    select: { id: true, name: true, email: true, role: true },
  });
}
