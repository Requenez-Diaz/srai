import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { Badge } from "@/app/src/components/ui/badge";
import Link from "next/link";

const stats = [
  { label: "Incidencias Abiertas", value: "12", color: "text-yellow-600" },
  { label: "En Progreso", value: "5", color: "text-blue-600" },
  { label: "Resueltas Hoy", value: "3", color: "text-green-600" },
  { label: "Actividades Programadas", value: "8", color: "text-purple-600" },
];

const recentIssues = [
  { id: "1", title: "Proyector dañado en Aula 101", status: "OPEN", priority: "HIGH", location: "Edificio A - 101" },
  { id: "2", title: "Fallo en conexión WiFi", status: "IN_PROGRESS", priority: "CRITICAL", location: "Biblioteca" },
  { id: "3", title: "Silla rota en laboratorio", status: "RESOLVED", priority: "LOW", location: "Lab. 3" },
];

export default function DashboardPage() {
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
            {recentIssues.map((issue) => (
              <Link
                key={issue.id}
                href={`/dashboard/issues/${issue.id}`}
                className="flex items-center justify-between rounded-lg border border-zinc-100 p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {issue.title}
                  </p>
                  <p className="text-xs text-zinc-500">{issue.location}</p>
                </div>
                <div className="ml-3 flex gap-2">
                  <Badge variant={issue.status === "OPEN" ? "open" : issue.status === "IN_PROGRESS" ? "in_progress" : "resolved"}>
                    {issue.status.replace("_", " ")}
                  </Badge>
                  <Badge variant={issue.priority === "HIGH" ? "high" : issue.priority === "CRITICAL" ? "critical" : "low"}>
                    {issue.priority}
                  </Badge>
                </div>
              </Link>
            ))}
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
