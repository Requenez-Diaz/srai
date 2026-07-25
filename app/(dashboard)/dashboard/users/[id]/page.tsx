import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/app/src/lib/auth";
import { getUserById } from "@/app/src/lib/actions/auth";
import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { Badge, roleBadge } from "@/app/src/components/ui/badge";
import { Button } from "@/app/src/components/ui/button";
import Link from "next/link";
import { DeleteUserButton } from "./actions";

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPPORT" && user.role !== "ADMIN")) redirect("/dashboard");

  const targetUser = await getUserById(id);
  if (!targetUser) notFound();

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/users"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          ← Volver a Usuarios
        </Link>
        <div className="flex gap-2">
          <Link href={`/dashboard/users/${targetUser.id}/edit`}>
            <Button variant="secondary" size="sm">Editar</Button>
          </Link>
          <DeleteUserButton userId={targetUser.id} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{targetUser.name}</CardTitle>
              <p className="mt-1 text-sm text-zinc-500">
                Creado el {targetUser.createdAt.toLocaleDateString("es-ES")}
              </p>
            </div>
            <Badge variant={roleBadge(targetUser.role)}>{targetUser.role}</Badge>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="mb-1 text-sm font-medium text-zinc-500">Email</h4>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">{targetUser.email}</p>
            </div>
            <div>
              <h4 className="mb-1 text-sm font-medium text-zinc-500">Rol</h4>
              <p className="text-sm text-zinc-900 dark:text-zinc-100">{targetUser.role}</p>
            </div>
            {targetUser.faculty && (
              <div>
                <h4 className="mb-1 text-sm font-medium text-zinc-500">Facultad</h4>
                <p className="text-sm text-zinc-900 dark:text-zinc-100">{targetUser.faculty}</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
