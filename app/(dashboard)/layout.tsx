import Link from "next/link";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: "◻" },
  { label: "Incidencias", href: "/dashboard/issues", icon: "⚠" },
  { label: "Actividades", href: "/dashboard/activities", icon: "📅" },
  { label: "Ubicaciones", href: "/dashboard/locations", icon: "📍" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-14 items-center gap-2 border-b border-zinc-200 px-6 dark:border-zinc-800">
          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">SRAI</span>
          <span className="text-xs text-zinc-500">v1.0</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-500">
            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-700" />
            <div className="flex-1 truncate">
              <p className="font-medium text-zinc-900 dark:text-zinc-50">Usuario</p>
              <p className="text-xs">admin@mail.com</p>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 bg-zinc-50 dark:bg-zinc-900">
        <header className="flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Panel de Control</h1>
          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <span>Admin</span>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
