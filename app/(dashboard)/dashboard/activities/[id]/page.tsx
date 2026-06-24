import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { Badge } from "@/app/src/components/ui/badge";
import { Button } from "@/app/src/components/ui/button";
import Link from "next/link";

const activitiesDb = [
  {
    id: "1",
    title: "Taller de Robótica",
    description: "Taller práctico de robótica educativa donde los estudiantes aprenderán los fundamentos de programación de robots usando Arduino y sensores básicos.",
    startDate: "28/06/2026",
    endDate: "28/06/2026",
    startTime: "10:00",
    endTime: "13:00",
    location: { building: "Laboratorio", room: "Robótica", floor: 2 },
    organizer: { name: "Dr. Ramírez", email: "ramirez@mail.com" },
    createdAt: "20/06/2026",
  },
  {
    id: "2",
    title: "Conferencia: IA en la Educación",
    description: "Charla sobre inteligencia artificial aplicada a la educación moderna. Se abordarán temas como aprendizaje automático, procesamiento de lenguaje natural y sus aplicaciones en el aula.",
    startDate: "30/06/2026",
    endDate: "30/06/2026",
    startTime: "16:00",
    endTime: "18:00",
    location: { building: "Auditorio", room: "Principal A", floor: 1 },
    organizer: { name: "Dra. Torres", email: "torres@mail.com" },
    createdAt: "15/06/2026",
  },
];

export default async function ActivityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const activity = activitiesDb.find((a) => a.id === id);
  if (!activity) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/activities" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50">
          ← Volver a Actividades
        </Link>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm">Editar</Button>
          <Button variant="danger" size="sm">Eliminar</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge>Actividad</Badge>
              </div>
              <CardTitle className="mt-2 text-xl">{activity.title}</CardTitle>
              <p className="mt-1 text-sm text-zinc-500">Creado el {activity.createdAt}</p>
            </div>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <h4 className="mb-1 text-sm font-medium text-zinc-500">Descripción</h4>
            <p className="text-sm text-zinc-900 dark:text-zinc-100">{activity.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="mb-1 text-sm font-medium text-zinc-500">Fecha de inicio</h4>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">{activity.startDate} - {activity.startTime}</p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-zinc-500">Fecha de fin</h4>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">{activity.endDate} - {activity.endTime}</p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-zinc-500">Ubicación</h4>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                {activity.location.building} - {activity.location.room} (Piso {activity.location.floor})
              </p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-zinc-500">Organizador</h4>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">{activity.organizer.name}</p>
              <p className="text-xs text-zinc-500">{activity.organizer.email}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
