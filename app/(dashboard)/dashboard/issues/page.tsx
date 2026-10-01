import { Card } from "@/app/src/components/ui/card";
import { Badge, statusBadge, priorityBadge } from "@/app/src/components/ui/badge";
import { Button } from "@/app/src/components/ui/button";
import Link from "next/link";
import { getIssues } from "@/app/src/lib/actions/issues";
import { formatDate } from "@/app/src/lib/date-format";

export default async function IssuesPage() {
  const issues = await getIssues();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">Incidencias</h2>
          <p className="text-sm text-zinc-500">Gestiona los reportes de problemas</p>
        </div>
        <Link href="/dashboard/issues/new" className="shrink-0 self-start sm:self-auto">
          <Button className="w-full sm:w-auto">Nueva Incidencia</Button>
        </Link>
      </div>

      {issues.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-zinc-500">
            No hay incidencias reportadas.
          </p>
        </Card>
      ) : (
        <>
          <Card className="hidden p-0 sm:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Título</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Ubicación</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Reportado por</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Estado</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Prioridad</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {issues.map((issue) => (
                    <tr
                      key={issue.id}
                      className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/issues/${issue.id}`}
                          className="font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-400"
                        >
                          {issue.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {issue.location.building} - {issue.location.room}
                      </td>
                      <td className="px-4 py-3 text-zinc-500">{issue.reportedBy.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant={statusBadge(issue.status)}>
                          {issue.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={priorityBadge(issue.priority)}>{issue.priority}</Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-500">
                        {formatDate(issue.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-3 sm:hidden">
            {issues.map((issue) => (
              <Card key={issue.id} className="p-4">
                <Link
                  href={`/dashboard/issues/${issue.id}`}
                  className="block space-y-3"
                >
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {issue.title}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={statusBadge(issue.status)}>
                      {issue.status.replace("_", " ")}
                    </Badge>
                    <Badge variant={priorityBadge(issue.priority)}>
                      {issue.priority}
                    </Badge>
                  </div>
                  <dl className="space-y-1 text-xs text-zinc-500">
                    <div className="flex justify-between gap-3">
                      <dt>Ubicación</dt>
                      <dd className="truncate text-right">
                        {issue.location.building} - {issue.location.room}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Reportado por</dt>
                      <dd className="truncate text-right">{issue.reportedBy.name}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt>Fecha</dt>
                      <dd className="shrink-0 text-right">
                        {formatDate(issue.createdAt)}
                      </dd>
                    </div>
                  </dl>
                </Link>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
