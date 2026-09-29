import { Card } from "@/app/src/components/ui/card";
import { Badge } from "@/app/src/components/ui/badge";
import { Button } from "@/app/src/components/ui/button";
import Link from "next/link";
import { getActivities } from "@/app/src/lib/actions/activities";
import { getCurrentUser } from "@/app/src/lib/auth";

function canCreate(role: string) {
  return role === "PRACTICANTE" || role === "TEACHER" || role === "SUPPORT" || role === "ADMIN";
}

export default async function ActivitiesPage() {
  const user = await getCurrentUser();
  const activities = await getActivities();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">Actividades</h2>
          <p className="text-sm text-zinc-500">Calendario de actividades académicas</p>
        </div>
        {user && canCreate(user.role) && (
          <Link href="/dashboard/activities/new" className="shrink-0 self-start sm:self-auto">
            <Button className="w-full sm:w-auto">Nueva Actividad</Button>
          </Link>
        )}
      </div>

      {activities.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-zinc-500">
            No hay actividades registradas.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity) => (
            <Link key={activity.id} href={`/dashboard/activities/${activity.id}`}>
              <Card className="h-full transition-colors hover:border-zinc-300 dark:hover:border-zinc-600">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="default">Actividad</Badge>
                    <span className="text-xs text-zinc-400">
                      {activity.startDate.toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {activity.title}
                  </h3>
                  <p className="text-sm text-zinc-500 line-clamp-2">
                    {activity.description}
                  </p>
                  <div className="flex flex-col gap-1 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
                    <span className="truncate">
                      📍 {activity.location.building} - {activity.location.room}
                    </span>
                    <span className="truncate">👤 {activity.organizer.name}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
