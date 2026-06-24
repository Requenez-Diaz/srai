import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { Badge } from "@/app/src/components/ui/badge";

const locations = [
  { building: "Edificio A", rooms: ["101", "102", "103", "201", "202"], floorCount: 3 },
  { building: "Edificio B", rooms: ["001", "002", "101", "102"], floorCount: 2 },
  { building: "Edificio Central", rooms: ["Principal", "Sala A", "Sala B"], floorCount: 4 },
  { building: "Biblioteca", rooms: ["Sala Estudio", "Sala Silencio", "Hemeroteca"], floorCount: 2 },
  { building: "Laboratorio", rooms: ["Química", "Física", "Robótica", "Cómputo 1", "Cómputo 2"], floorCount: 2 },
  { building: "Auditorio", rooms: ["Principal A", "Principal B"], floorCount: 1 },
];

export default function LocationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Ubicaciones</h2>
        <p className="text-sm text-zinc-500">Catálogo de edificios y aulas registradas</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((loc) => (
          <Card key={loc.building}>
            <CardHeader>
              <CardTitle>{loc.building}</CardTitle>
              <p className="text-xs text-zinc-500">{loc.floorCount} pisos · {loc.rooms.length} espacios</p>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              {loc.rooms.map((room) => (
                <Badge key={room} variant="default">{room}</Badge>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
