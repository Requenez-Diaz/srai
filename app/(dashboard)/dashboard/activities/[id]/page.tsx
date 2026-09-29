import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { Badge } from "@/app/src/components/ui/badge";
import { Button } from "@/app/src/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/app/src/lib/auth";
import { getActivityById } from "@/app/src/lib/actions/activities";
import { DeleteActivityButton } from "./delete-button";

function canManageAll(role: string) {
  return role === "SUPPORT" || role === "ADMIN";
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await getActivityById(id);
  if (!activity) notFound();

  const user = await getCurrentUser();
  const isOwner = user?.id === activity.organizerId;
  const canEdit = user && (canManageAll(user.role) || isOwner);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/dashboard/activities"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          ← Volver a Actividades
        </Link>
        {canEdit && (
          <div className="flex gap-2 sm:shrink-0">
            <Link href={`/dashboard/activities/${activity.id}/edit`} className="flex-1 sm:flex-none">
              <Button variant="secondary" size="sm" className="w-full">Editar</Button>
            </Link>
            <DeleteActivityButton activityId={activity.id} />
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="min-w-0">
            <Badge>Actividad</Badge>
            <CardTitle className="mt-2 text-lg sm:text-xl">{activity.title}</CardTitle>
            <p className="mt-1 text-sm text-zinc-500">
              Creado el {activity.createdAt.toLocaleDateString()}
            </p>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <h4 className="mb-1 text-sm font-medium text-zinc-500">Descripción</h4>
            <p className="text-sm text-zinc-900 dark:text-zinc-100">
              {activity.description ?? "Sin descripción"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
            <div className="min-w-0">
              <h4 className="mb-1 text-sm font-medium text-zinc-500">Organizador</h4>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">
                {activity.organizer.name}
              </p>
              <p className="truncate text-xs text-zinc-500">{activity.organizer.email}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
