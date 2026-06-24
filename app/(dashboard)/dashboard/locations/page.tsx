import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { Badge } from "@/app/src/components/ui/badge";
import { getLocations } from "@/app/src/lib/actions/locations";
import { CreateLocationForm } from "./create-form";

export default async function LocationsPage() {
  const locations = await getLocations();

  const grouped = locations.reduce(
    (acc, loc) => {
      if (!acc[loc.building]) acc[loc.building] = [];
      acc[loc.building].push(loc);
      return acc;
    },
    {} as Record<string, typeof locations>,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Ubicaciones</h2>
          <p className="text-sm text-zinc-500">Catálogo de edificios y aulas registradas</p>
        </div>
        <CreateLocationForm />
      </div>

      {Object.keys(grouped).length === 0 ? (
        <Card>
          <p className="text-center text-sm text-zinc-500">
            No hay ubicaciones registradas. Usa el botón "Agregar" para crear la primera.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(grouped).map(([building, rooms]) => {
            const floors = [...new Set(rooms.map((r) => r.floor))];
            return (
              <Card key={building}>
                <CardHeader>
                  <CardTitle>{building}</CardTitle>
                  <p className="text-xs text-zinc-500">
                    {floors.length} {floors.length === 1 ? "piso" : "pisos"} · {rooms.length}{" "}
                    {rooms.length === 1 ? "espacio" : "espacios"}
                  </p>
                </CardHeader>
                <div className="flex flex-wrap gap-2">
                  {rooms.map((room) => (
                    <Badge key={room.id} variant="default">
                      {room.room}
                    </Badge>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
