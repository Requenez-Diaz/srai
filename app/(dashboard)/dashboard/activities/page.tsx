import { Card } from "@/app/src/components/ui/card";
import { Badge } from "@/app/src/components/ui/badge";
import { Button } from "@/app/src/components/ui/button";
import Link from "next/link";
import { getActivities } from "@/app/src/lib/actions/activities";

export default async function ActivitiesPage() {
  const activities = await getActivities();

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

      {activities.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-zinc-500">
            No hay actividades registradas. Crea la primera.
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
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>
                      📍 {activity.location.building} - {activity.location.room}
                    </span>
                    <span>👤 {activity.organizer.name}</span>
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
