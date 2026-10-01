import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/src/lib/auth";
import { getUsers } from "@/app/src/lib/actions/auth";
import { formatDate } from "@/app/src/lib/date-format";
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">Usuarios</h2>
          <p className="text-sm text-zinc-500">Gestiona los usuarios del sistema</p>
        </div>
        <Link href="/dashboard/users/new" className="shrink-0 self-start sm:self-auto">
          <Button className="w-full sm:w-auto">Nuevo Usuario</Button>
        </Link>
      </div>

      {users.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-zinc-500">
            No hay usuarios registrados.
          </p>
        </Card>
      ) : (
        <>
          <Card className="hidden p-0 sm:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
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
                      <td className="px-4 py-3 whitespace-nowrap text-zinc-500">
                        {formatDate(u.createdAt)}
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

          <div className="space-y-3 sm:hidden">
            {users.map((u) => (
              <Card key={u.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/dashboard/users/${u.id}`}
                        className="font-medium text-zinc-900 dark:text-zinc-50"
                      >
                        {u.name}
                      </Link>
                      <p className="truncate text-xs text-zinc-500">{u.email}</p>
                    </div>
                    <Badge variant={roleBadge(u.role)}>{u.role}</Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-3 dark:border-zinc-800">
                    <span className="text-xs text-zinc-500">
                      Creado {formatDate(u.createdAt)}
                    </span>
                    <DeleteUserButton userId={u.id} currentUserId={user.id} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
