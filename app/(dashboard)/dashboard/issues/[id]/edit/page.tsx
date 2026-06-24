import { notFound } from "next/navigation";
import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import Link from "next/link";
import { getIssueById } from "@/app/src/lib/actions/issues";
import { getLocations } from "@/app/src/lib/actions/locations";
import { EditIssueForm } from "./form";

export default async function EditIssuePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const issue = await getIssueById(id);
  if (!issue) notFound();

  const locations = await getLocations();
  const buildings = [...new Set(locations.map((l) => l.building))].sort();

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/dashboard/issues" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          Incidencias
        </Link>
        <span>/</span>
        <Link
          href={`/dashboard/issues/${id}`}
          className="hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          {issue.title}
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-50">Editar</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Incidencia</CardTitle>
        </CardHeader>
        <EditIssueForm
          issueId={issue.id}
          defaultTitle={issue.title}
          defaultDescription={issue.description ?? ""}
          defaultLocationId={issue.locationId}
          defaultPriority={issue.priority}
          locations={locations}
          buildings={buildings}
        />
      </Card>
    </div>
  );
}
