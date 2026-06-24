import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import Link from "next/link";
import { getActivityById } from "@/app/src/lib/actions/activities";
import { getLocations } from "@/app/src/lib/actions/locations";
import { EditActivityForm } from "./form";

export default async function EditActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await getActivityById(id);
  if (!activity) notFound();

  const locations = await getLocations();
  const buildings = [...new Set(locations.map((l) => l.building))].sort();

  const toDateInput = (d: Date) => d.toISOString().slice(0, 10);
  const toTimeInput = (d: Date) => d.toISOString().slice(11, 16);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/dashboard/activities" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          Actividades
        </Link>
        <span>/</span>
        <Link
          href={`/dashboard/activities/${id}`}
          className="hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          {activity.title}
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-50">Editar</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Actividad</CardTitle>
        </CardHeader>
        <EditActivityForm
          activityId={activity.id}
          defaultTitle={activity.title}
          defaultDescription={activity.description ?? ""}
          defaultStartDate={toDateInput(activity.startDate)}
          defaultStartTime={toTimeInput(activity.startDate)}
          defaultEndDate={toDateInput(activity.endDate)}
          defaultEndTime={toTimeInput(activity.endDate)}
          defaultLocationId={activity.locationId}
          locations={locations}
          buildings={buildings}
        />
      </Card>
    </div>
  );
}
