import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { Badge, statusBadge, priorityBadge } from "@/app/src/components/ui/badge";
import { Button } from "@/app/src/components/ui/button";
import Link from "next/link";

const issuesDb = [
  {
    id: "1",
    title: "Proyector dañado en Aula 101",
    description: "El proyector del aula 101 no enciende. Se intentó reiniciar pero no hubo respuesta. El cable de alimentación parece estar en buen estado.",
    status: "OPEN",
    priority: "HIGH",
    location: { building: "Edificio A", room: "101", floor: 1 },
    reportedBy: { name: "Carlos López", email: "carlos@mail.com", role: "TEACHER" },
    assignedTo: null,
    createdAt: "24/06/2026 10:30",
    photoUrl: null,
    history: [
      { status: "OPEN", user: "Carlos López", date: "24/06/2026 10:30", comment: "Incidencia reportada" },
    ],
  },
  {
    id: "2",
    title: "Fallo en conexión WiFi del edificio central",
    description: "Desde esta mañana no hay conexión a internet en todo el edificio central. Afecta a todas las aulas y oficinas administrativas.",
    status: "IN_PROGRESS",
    priority: "CRITICAL",
    location: { building: "Edificio Central", room: "General", floor: 1 },
    reportedBy: { name: "María García", email: "maria@mail.com", role: "STUDENT" },
    assignedTo: { name: "Soporte TI", email: "ti@mail.com", role: "SUPPORT" },
    createdAt: "23/06/2026 08:15",
    photoUrl: null,
    history: [
      { status: "OPEN", user: "María García", date: "23/06/2026 08:15", comment: "Incidencia reportada" },
      { status: "IN_PROGRESS", user: "Soporte TI", date: "23/06/2026 09:00", comment: "Asignado al equipo de soporte. Revisando router principal." },
    ],
  },
];

export default async function IssueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const issue = issuesDb.find((i) => i.id === id);
  if (!issue) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/issues" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          ← Volver a Incidencias
        </Link>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">Asignar</Button>
          <Button size="sm">Actualizar Estado</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{issue.title}</CardTitle>
              <p className="mt-1 text-sm text-zinc-500">Creado el {issue.createdAt}</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={statusBadge(issue.status)}>{issue.status.replace("_", " ")}</Badge>
              <Badge variant={priorityBadge(issue.priority)}>{issue.priority}</Badge>
            </div>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <h4 className="mb-1 text-sm font-medium text-zinc-500">Descripción</h4>
            <p className="text-sm text-zinc-900 dark:text-zinc-100">{issue.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="mb-1 text-sm font-medium text-zinc-500">Ubicación</h4>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                {issue.location.building} - {issue.location.room} (Piso {issue.location.floor})
              </p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-zinc-500">Reportado por</h4>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">{issue.reportedBy.name}</p>
              <p className="text-xs text-zinc-500">{issue.reportedBy.email}</p>
            </div>
            {issue.assignedTo && (
              <div>
                <h4 className="mb-1 text-sm font-medium text-zinc-500">Asignado a</h4>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">{issue.assignedTo.name}</p>
                <p className="text-xs text-zinc-500">{issue.assignedTo.email}</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Cambios</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          {issue.history.map((entry, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                {i < issue.history.length - 1 && <div className="h-full w-px bg-zinc-200 dark:bg-zinc-700" />}
              </div>
              <div className="flex-1 pb-4">
                <div className="flex items-center gap-2">
                  <Badge variant={statusBadge(entry.status)}>{entry.status.replace("_", " ")}</Badge>
                  <span className="text-xs text-zinc-500">por {entry.user}</span>
                  <span className="text-xs text-zinc-400">{entry.date}</span>
                </div>
                {entry.comment && (
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{entry.comment}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agregar Comentario</CardTitle>
        </CardHeader>
        <form className="space-y-3">
          <textarea
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800"
            rows={3}
            placeholder="Escribe un comentario..."
          />
          <div className="flex gap-2">
            <select className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800">
              <option value="OPEN">Abierto</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="RESOLVED">Resuelto</option>
              <option value="REJECTED">Rechazado</option>
            </select>
            <Button type="submit" size="sm">Actualizar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
