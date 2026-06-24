const variants = {
  default: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  open: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  resolved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  low: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  high: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  student: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  teacher: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  support: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

export function statusBadge(status: string) {
  const map: Record<string, keyof typeof variants> = {
    OPEN: "open",
    IN_PROGRESS: "in_progress",
    RESOLVED: "resolved",
    REJECTED: "rejected",
  };
  return map[status] ?? "default";
}

export function priorityBadge(priority: string) {
  const map: Record<string, keyof typeof variants> = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    CRITICAL: "critical",
  };
  return map[priority] ?? "default";
}

export function roleBadge(role: string) {
  const map: Record<string, keyof typeof variants> = {
    STUDENT: "student",
    TEACHER: "teacher",
    SUPPORT: "support",
    ADMIN: "admin",
  };
  return map[role] ?? "default";
}
