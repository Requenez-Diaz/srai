import { Card } from "@/app/src/components/ui/card";
import { Badge, statusBadge, priorityBadge } from "@/app/src/components/ui/badge";
import { Button } from "@/app/src/components/ui/button";
import Link from "next/link";
import { getIssues } from "@/app/src/lib/actions/issues";

export default async function IssuesPage() {
  const issues = await getIssues();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Incidencias</h2>
          <p className="text-sm text-zinc-500">Gestiona los reportes de problemas</p>
        </div>
        <Link href="/dashboard/issues/new">
          <Button>Nueva Incidencia</Button>
        </Link>
      </div>

      {issues.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-zinc-500">
            No hay incidencias reportadas.
          </p>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
                    <td className="px-4 py-3 text-zinc-500">
                      {issue.createdAt.toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
