import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { Badge, statusBadge, priorityBadge } from "@/app/src/components/ui/badge";
import { Button } from "@/app/src/components/ui/button";
import Link from "next/link";
import { getIssueById, getSupportUsers } from "@/app/src/lib/actions/issues";
import { IssueActions, DeleteIssueButton } from "./actions";

export default async function IssueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const issue = await getIssueById(id);
  if (!issue) notFound();

  const supportUsers = await getSupportUsers();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/issues"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          ← Volver a Incidencias
        </Link>
        <div className="flex gap-2">
          <Link href={`/dashboard/issues/${issue.id}/edit`}>
            <Button variant="secondary" size="sm">
              Editar
            </Button>
          </Link>
          <DeleteIssueButton issueId={issue.id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{issue.title}</CardTitle>
              <p className="mt-1 text-sm text-zinc-500">
                Creado el {issue.createdAt.toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant={statusBadge(issue.status)}>
                {issue.status.replace("_", " ")}
              </Badge>
              <Badge variant={priorityBadge(issue.priority)}>{issue.priority}</Badge>
            </div>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <h4 className="mb-1 text-sm font-medium text-zinc-500">Descripción</h4>
            <p className="text-sm text-zinc-900 dark:text-zinc-100">
              {issue.description ?? "Sin descripción"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="mb-1 text-sm font-medium text-zinc-500">Ubicación</h4>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                {issue.location.building} - {issue.location.room} (Piso{" "}
                {issue.location.floor})
              </p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-zinc-500">Reportado por</h4>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                {issue.reportedBy.name}
              </p>
              <p className="text-xs text-zinc-500">{issue.reportedBy.email}</p>
            </div>
            {issue.assignedTo && (
              <div>
                <h4 className="mb-1 text-sm font-medium text-zinc-500">Asignado a</h4>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">
                  {issue.assignedTo.name}
                </p>
                <p className="text-xs text-zinc-500">{issue.assignedTo.email}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
        </CardHeader>
        <IssueActions issueId={issue.id} currentStatus={issue.status} supportUsers={supportUsers} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Cambios</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          {issue.history.length === 0 ? (
            <p className="text-sm text-zinc-500">Sin historial</p>
          ) : (
            issue.history.map((entry, i) => (
              <div key={entry.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                  {i < issue.history.length - 1 && (
                    <div className="h-full w-px bg-zinc-200 dark:bg-zinc-700" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusBadge(entry.newStatus)}>
                      {entry.newStatus.replace("_", " ")}
                    </Badge>
                    <span className="text-xs text-zinc-500">por {entry.user.name}</span>
                    <span className="text-xs text-zinc-400">
                      {entry.createdAt.toLocaleString()}
                    </span>
                  </div>
                  {entry.comment && (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {entry.comment}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
