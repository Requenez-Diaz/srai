import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/app/src/lib/auth";
import { getAttendanceByUser } from "@/app/src/lib/actions/attendance";
import { Card } from "@/app/src/components/ui/card";
import { Badge } from "@/app/src/components/ui/badge";
import Link from "next/link";

function formatTime(date: Date | null) {
  if (!date) return "--:--";
  return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function calcHours(start: Date | null, end: Date | null) {
  if (!start || !end) return null;
  return ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1);
}

function totalHours(
  morningIn: Date | null,
  morningOut: Date | null,
  afternoonIn: Date | null,
  afternoonOut: Date | null,
) {
  const morningHours = calcHours(morningIn, morningOut);
  const afternoonHours = calcHours(afternoonIn, afternoonOut);
  return morningHours && afternoonHours
    ? (parseFloat(morningHours) + parseFloat(afternoonHours)).toFixed(1)
    : (morningHours ?? afternoonHours ?? null);
}

export default async function UserAttendancePage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { userId } = await params;
  const { page: pageParam } = await searchParams;
  const user = await getCurrentUser();
  if (!user || (user.role !== "SUPPORT" && user.role !== "ADMIN")) redirect("/dashboard");

  const page = parseInt(pageParam ?? "1", 10);
  const { records, totalPages, user: targetUser } = await getAttendanceByUser(userId, page);

  if (!targetUser) notFound();

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
        <Link href="/dashboard/attendance/history" className="hover:text-zinc-900 dark:hover:text-zinc-50">
          Historial
        </Link>
        <span>/</span>
        <span className="truncate text-zinc-900 dark:text-zinc-50">{targetUser.name}</span>
      </nav>

      <div className="min-w-0">
        <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">{targetUser.name}</h2>
        <p className="break-all text-sm text-zinc-500">{targetUser.email} — {targetUser.role}</p>
      </div>

      {records.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-zinc-500">No hay registros de asistencia</p>
        </Card>
      ) : (
        <>
          <Card className="hidden p-0 sm:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Fecha</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Entrada M.</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Salida M.</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Entrada T.</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Salida T.</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Horas</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => {
                    const total = totalHours(record.morningIn, record.morningOut, record.afternoonIn, record.afternoonOut);

                    return (
                      <tr
                        key={record.id}
                        className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-500">
                          {record.date.toLocaleDateString("es-MX")}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-500">{formatTime(record.morningIn)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-500">{formatTime(record.morningOut)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-500">{formatTime(record.afternoonIn)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-500">{formatTime(record.afternoonOut)}</td>
                        <td className="px-4 py-3">
                          {total ? (
                            <Badge variant="resolved">{total}h</Badge>
                          ) : (
                            <Badge variant="default">--</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-3 sm:hidden">
            {records.map((record) => {
              const total = totalHours(record.morningIn, record.morningOut, record.afternoonIn, record.afternoonOut);

              return (
                <Card key={record.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {record.date.toLocaleDateString("es-MX")}
                      </p>
                      {total ? (
                        <Badge variant="resolved">{total}h</Badge>
                      ) : (
                        <Badge variant="default">--</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 pt-3 text-xs dark:border-zinc-800">
                      <div>
                        <p className="text-zinc-500">Mañana</p>
                        <p className="mt-0.5 text-zinc-900 dark:text-zinc-100">
                          {formatTime(record.morningIn)} → {formatTime(record.morningOut)}
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Tarde</p>
                        <p className="mt-0.5 text-zinc-900 dark:text-zinc-100">
                          {formatTime(record.afternoonIn)} → {formatTime(record.afternoonOut)}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {page > 1 && (
                <Link
                  href={`/dashboard/attendance/history/${userId}?page=${page - 1}`}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  ← Anterior
                </Link>
              )}
              <span className="text-sm text-zinc-500">
                Página {page} de {totalPages}
              </span>
              {page < totalPages && (
                <Link
                  href={`/dashboard/attendance/history/${userId}?page=${page + 1}`}
                  className="rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Siguiente →
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
