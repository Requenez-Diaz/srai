import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/app/src/lib/auth";
import { getUserById } from "@/app/src/lib/actions/auth";
import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import Link from "next/link";
import { EditUserForm } from "./form";

export default async function EditUserPage({
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
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/dashboard/users" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          Usuarios
        </Link>
        <span>/</span>
        <Link
          href={`/dashboard/users/${id}`}
          className="hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          {targetUser.name}
        </Link>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-50">Editar</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Editar Usuario</CardTitle>
        </CardHeader>
        <EditUserForm
          userId={targetUser.id}
          defaultName={targetUser.name}
          defaultEmail={targetUser.email}
          defaultRole={targetUser.role}
          defaultFaculty={targetUser.faculty ?? ""}
        />
      </Card>
    </div>
  );
}
