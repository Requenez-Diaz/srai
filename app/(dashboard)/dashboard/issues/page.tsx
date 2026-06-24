import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { Badge, statusBadge, priorityBadge } from "@/app/src/components/ui/badge";
import { Button } from "@/app/src/components/ui/button";
import Link from "next/link";

const issues = [
  { id: "1", title: "Proyector dañado en Aula 101", status: "OPEN", priority: "HIGH", location: "Edificio A - 101", reportedBy: "Carlos López", date: "24/06/2026" },
  { id: "2", title: "Fallo en conexión WiFi del edificio central", status: "IN_PROGRESS", priority: "CRITICAL", location: "Biblioteca", reportedBy: "María García", date: "23/06/2026" },
  { id: "3", title: "Silla rota en laboratorio de química", status: "RESOLVED", priority: "LOW", location: "Lab. Química 3", reportedBy: "Juan Pérez", date: "22/06/2026" },
  { id: "4", title: "Fuga de agua en baño de segundo piso", status: "OPEN", priority: "MEDIUM", location: "Edificio B - 2do Piso", reportedBy: "Ana Martínez", date: "21/06/2026" },
  { id: "5", title: "Sensor de temperatura averiado", status: "REJECTED", priority: "LOW", location: "Invernadero", reportedBy: "Pedro Sánchez", date: "20/06/2026" },
];

export default function IssuesPage() {
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
                  <td className="px-4 py-3 text-zinc-500">{issue.location}</td>
                  <td className="px-4 py-3 text-zinc-500">{issue.reportedBy}</td>
                  <td className="px-4 py-3">
                    <Badge variant={statusBadge(issue.status)}>{issue.status.replace("_", " ")}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={priorityBadge(issue.priority)}>{issue.priority}</Badge>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{issue.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
