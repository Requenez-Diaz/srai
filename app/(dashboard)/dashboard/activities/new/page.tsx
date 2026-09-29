import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { getLocations } from "@/app/src/lib/actions/locations";
import { CreateActivityForm } from "./form";

export default async function NewActivityPage() {
  const locations = await getLocations();
  const buildings = [...new Set(locations.map((l) => l.building))].sort();

  return (
    <div className='max-w-2xl space-y-6'>
      <div className='min-w-0'>
        <h2 className='text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50'>
          Registrar Actividad
        </h2>
        <p className='text-sm text-zinc-500'>
          Crea una nueva actividad académica o evento
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva Actividad</CardTitle>
        </CardHeader>
        <CreateActivityForm locations={locations} buildings={buildings} />
      </Card>
    </div>
  );
}
