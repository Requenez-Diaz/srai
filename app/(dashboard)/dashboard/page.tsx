import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { Badge, statusBadge, priorityBadge } from "@/app/src/components/ui/badge";
import Link from "next/link";
import db from "@/app/src/lib/db";

export default async function DashboardPage() {
  const [openCount, inProgressCount, resolvedTodayCount, activityCount, recentIssues] =
    await Promise.all([
      db.issue.count({ where: { status: "OPEN" } }),
      db.issue.count({ where: { status: "IN_PROGRESS" } }),
      db.issue.count({
        where: {
          status: "RESOLVED",
          updatedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      db.activity.count({
        where: { startDate: { gte: new Date() } },
      }),
      db.issue.findMany({
        take: 5,
        include: { location: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

  const stats = [
    { label: "Incidencias Abiertas", value: openCount, color: "text-yellow-600" },
    { label: "En Progreso", value: inProgressCount, color: "text-blue-600" },
    { label: "Resueltas Hoy", value: resolvedTodayCount, color: "text-green-600" },
    { label: "Próximas Actividades", value: activityCount, color: "text-purple-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Resumen General</h2>
        <p className="text-sm text-zinc-500">Estado actual del sistema</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm text-zinc-500">{stat.label}</p>
            <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Incidencias Recientes</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {recentIssues.length === 0 ? (
              <p className="text-sm text-zinc-500">No hay incidencias</p>
            ) : (
              recentIssues.map((issue) => (
                <Link
                  key={issue.id}
                  href={`/dashboard/issues/${issue.id}`}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {issue.title}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {issue.location.building} - {issue.location.room}
                    </p>
                  </div>
                  <div className="ml-3 flex gap-2">
                    <Badge variant={statusBadge(issue.status)}>
                      {issue.status.replace("_", " ")}
                    </Badge>
                    <Badge variant={priorityBadge(issue.priority)}>
                      {issue.priority}
                    </Badge>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <Link
              href="/dashboard/issues/new"
              className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-lg dark:bg-yellow-900/30">⚠</span>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">Reportar Incidencia</p>
                <p className="text-sm text-zinc-500">Notifica un problema en una ubicación</p>
              </div>
            </Link>
            <Link
              href="/dashboard/activities/new"
              className="flex items-center gap-3 rounded-lg border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-lg dark:bg-purple-900/30">📅</span>
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-50">Registrar Actividad</p>
                <p className="text-sm text-zinc-500">Crea una nueva actividad académica</p>
              </div>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
