import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { getLocations } from "@/app/src/lib/actions/locations";
import { CreateIssueForm } from "./form";

export default async function NewIssuePage() {
  const locations = await getLocations();
  const buildings = [...new Set(locations.map((l) => l.building))].sort();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Reportar Incidencia</h2>
        <p className="text-sm text-zinc-500">Describe el problema para que podamos ayudarte</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nueva Incidencia</CardTitle>
        </CardHeader>
        <CreateIssueForm locations={locations} buildings={buildings} />
      </Card>
    </div>
  );
}
