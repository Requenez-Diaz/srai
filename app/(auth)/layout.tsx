import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/src/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-900">
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
