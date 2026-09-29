import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/src/lib/auth";
import { logout } from "@/app/src/lib/actions/auth";
import { MobileNav, SidebarNav } from "./sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col self-start border-r border-zinc-200 bg-white lg:flex dark:border-zinc-800 dark:bg-zinc-950">
        <SidebarNav name={user.name} email={user.email} role={user.role} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white/90 px-4 backdrop-blur sm:px-6 lg:px-8 dark:border-zinc-800 dark:bg-zinc-950/90">
          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            <MobileNav name={user.name} email={user.email} role={user.role} />
            <h1 className="truncate text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-50">
              Panel de Control
            </h1>
          </div>
          <form action={logout} className="shrink-0">
            <button
              type="submit"
              className="whitespace-nowrap text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
            >
              Cerrar Sesión
            </button>
          </form>
        </header>
        <main className="min-w-0 flex-1 bg-zinc-50 dark:bg-zinc-900">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
