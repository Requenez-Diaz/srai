"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge, roleBadge } from "@/app/src/components/ui/badge";

export type NavItem = { label: string; href: string; icon: string };

export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "◻" },
  { label: "Incidencias", href: "/dashboard/issues", icon: "⚠" },
  { label: "Actividades", href: "/dashboard/activities", icon: "📅" },
  { label: "Ubicaciones", href: "/dashboard/locations", icon: "📍" },
  { label: "Registro Horas", href: "/dashboard/attendance", icon: "🕐" },
];

export const adminNavItems: NavItem[] = [
  { label: "Usuarios", href: "/dashboard/users", icon: "👥" },
  { label: "Historial Asistencia", href: "/dashboard/attendance/history", icon: "📊" },
];

export function isAdmin(role: string) {
  return role === "SUPPORT" || role === "ADMIN";
}

function NavLinks({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
            }`}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

export function UserSummary({
  name,
  email,
  role,
  onNavigate,
}: {
  name: string;
  email: string;
  role: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="border-t border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-500">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
          {name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
              {name}
            </p>
            <Badge variant={roleBadge(role)}>{role}</Badge>
          </div>
          <p className="truncate text-xs">{email}</p>
        </div>
        {onNavigate && (
          <button
            type="button"
            onClick={onNavigate}
            className="shrink-0 text-xs text-zinc-400 transition-colors hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}

export function SidebarNav({
  name,
  email,
  role,
  onNavigate,
}: {
  name: string;
  email: string;
  role: string;
  onNavigate?: () => void;
}) {
  const items = isAdmin(role) ? [...navItems, ...adminNavItems] : navItems;

  return (
    <>
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-200 px-4 sm:px-6 dark:border-zinc-800">
        <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
          SRAI
        </span>
        <span className="text-xs text-zinc-500">v1.0</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <NavLinks items={items} onNavigate={onNavigate} />
      </nav>
      <UserSummary
        name={name}
        email={email}
        role={role}
        onNavigate={onNavigate}
      />
    </>
  );
}

export function MobileNav({
  name,
  email,
  role,
}: {
  name: string;
  email: string;
  role: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir menú"
        aria-expanded={open}
        className="-ml-2 flex h-10 w-10 items-center justify-center rounded-lg text-zinc-600 transition-colors hover:bg-zinc-100 lg:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <span aria-hidden="true" className="text-xl leading-none">
          ☰
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            <SidebarNav
              name={name}
              email={email}
              role={role}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
