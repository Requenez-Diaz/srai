import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/src/lib/auth";
import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { CreateUserForm } from "./form";

export default async function NewUserPage() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPPORT" && user.role !== "ADMIN")) redirect("/dashboard");

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Nuevo Usuario</h2>
        <p className="text-sm text-zinc-500">Crea una cuenta para un nuevo usuario</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
        </CardHeader>
        <CreateUserForm />
      </Card>
    </div>
  );
}
