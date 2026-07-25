import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/src/lib/auth";
import { getUsers } from "@/app/src/lib/actions/auth";
import { Card } from "@/app/src/components/ui/card";
import { Badge, roleBadge } from "@/app/src/components/ui/badge";
import { Button } from "@/app/src/components/ui/button";
import Link from "next/link";
import { DeleteUserButton } from "./delete-button";

export default async function UsersPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPPORT" && user.role !== "ADMIN")) redirect("/dashboard");

  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Usuarios</h2>
          <p className="text-sm text-zinc-500">Gestiona los usuarios del sistema</p>
        </div>
        <Link href="/dashboard/users/new">
          <Button>Nuevo Usuario</Button>
        </Link>
      </div>

      {users.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-zinc-500">
            No hay usuarios registrados.
          </p>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800">
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Nombre</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Email</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Rol</th>
                  <th className="px-4 py-3 text-left font-medium text-zinc-500">Creado</th>
                  <th className="px-4 py-3 text-right font-medium text-zinc-500">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/users/${u.id}`}
                        className="font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-400"
                      >
                        {u.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={roleBadge(u.role)}>{u.role}</Badge>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
                      {u.createdAt.toLocaleDateString("es-ES")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DeleteUserButton userId={u.id} currentUserId={user.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
