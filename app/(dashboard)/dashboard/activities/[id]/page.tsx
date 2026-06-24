import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { Badge } from "@/app/src/components/ui/badge";
import { Button } from "@/app/src/components/ui/button";
import Link from "next/link";
import { getActivityById } from "@/app/src/lib/actions/activities";
import { DeleteActivityButton } from "./delete-button";

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await getActivityById(id);
  if (!activity) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/activities"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          ← Volver a Actividades
        </Link>
        <div className="flex gap-2">
          <Link href={`/dashboard/activities/${activity.id}/edit`}>
            <Button variant="secondary" size="sm">Editar</Button>
          </Link>
          <DeleteActivityButton activityId={activity.id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <Badge>Actividad</Badge>
              <CardTitle className="mt-2 text-xl">{activity.title}</CardTitle>
              <p className="mt-1 text-sm text-zinc-500">
                Creado el {activity.createdAt.toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <h4 className="mb-1 text-sm font-medium text-zinc-500">Descripción</h4>
            <p className="text-sm text-zinc-900 dark:text-zinc-100">
              {activity.description ?? "Sin descripción"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="mb-1 text-sm font-medium text-zinc-500">Inicio</h4>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                {activity.startDate.toLocaleString()}
              </p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-zinc-500">Fin</h4>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                {activity.endDate.toLocaleString()}
              </p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-zinc-500">Ubicación</h4>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                {activity.location.building} - {activity.location.room} (Piso{" "}
                {activity.location.floor})
              </p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-zinc-500">Organizador</h4>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                {activity.organizer.name}
              </p>
              <p className="text-xs text-zinc-500">{activity.organizer.email}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
