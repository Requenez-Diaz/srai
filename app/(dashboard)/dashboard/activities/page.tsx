import { Card } from "@/app/src/components/ui/card";
import { Badge } from "@/app/src/components/ui/badge";
import { Button } from "@/app/src/components/ui/button";
import Link from "next/link";

const activities = [
  { id: "1", title: "Taller de Robótica", description: "Taller práctico de robótica educativa", startDate: "28/06/2026", endDate: "28/06/2026", location: "Lab. Robótica", organizer: "Dr. Ramírez" },
  { id: "2", title: "Conferencia: IA en la Educación", description: "Charla sobre inteligencia artificial aplicada", startDate: "30/06/2026", endDate: "30/06/2026", location: "Auditorio A", organizer: "Dra. Torres" },
  { id: "3", title: "Curso de Programación Web", description: "Curso intensivo de desarrollo web con React", startDate: "01/07/2026", endDate: "05/07/2026", location: "Lab. Cómputo 2", organizer: "Ing. Mendoza" },
  { id: "4", title: "Feria de Ciencias", description: "Exposición de proyectos estudiantiles", startDate: "15/07/2026", endDate: "16/07/2026", location: "Edificio Central", organizer: "Comité Académico" },
];

export default function ActivitiesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Actividades</h2>
          <p className="text-sm text-zinc-500">Calendario de actividades académicas</p>
        </div>
        <Link href="/dashboard/activities/new">
          <Button>Nueva Actividad</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((activity) => (
          <Link key={activity.id} href={`/dashboard/activities/${activity.id}`}>
            <Card className="h-full transition-colors hover:border-zinc-300 dark:hover:border-zinc-600">
              <div className="space-y-3">
                <Badge variant="default">Actividad</Badge>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{activity.title}</h3>
                <p className="text-sm text-zinc-500 line-clamp-2">{activity.description}</p>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>📅 {activity.startDate}</span>
                  {activity.startDate !== activity.endDate && <span>→ {activity.endDate}</span>}
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span>📍 {activity.location}</span>
                  <span>👤 {activity.organizer}</span>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
