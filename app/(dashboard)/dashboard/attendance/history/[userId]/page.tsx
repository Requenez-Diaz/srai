import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/app/src/lib/auth";
import { getAttendanceByUser } from "@/app/src/lib/actions/attendance";
import { Card } from "@/app/src/components/ui/card";
import Link from "next/link";
import { computeDayHours, formatShiftRange, formatTime } from "@/app/src/lib/attendance-hours";
import { canManageAttendance, canPickOtherUsers } from "@/app/src/lib/attendance-manual";
import { formatDbDate, getDateKey } from "@/app/src/lib/date-format";
import { getAttendanceUsers } from "@/app/src/lib/actions/attendance";
import { HoursBadge } from "../../hours-badge";
import { AttendanceRowActions } from "../attendance-row-actions";

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

  const days = records.map((record) => ({ record, day: computeDayHours(record) }));
  const incompleteDays = days.filter(({ day }) => day.missingCount > 0).length;
  const periodTotalMinutes = days.reduce((acc, { day }) => acc + day.totalMinutes, 0);

  const users = await getAttendanceUsers();
  const canPickUser = canPickOtherUsers(user.role);
  const canManage = canManageAttendance(user, userId);
  const todayKey = getDateKey();

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
        <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">
          Horas prácticas — {targetUser.name}
        </h2>
        <p className="break-all text-sm text-zinc-500">{targetUser.email} — {targetUser.role}</p>
      </div>

      {records.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-sm text-zinc-500">Días registrados</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {days.length}
            </p>
          </Card>
          <Card>
            <p className="text-sm text-zinc-500">Horas en esta página</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {(periodTotalMinutes / 60).toFixed(2)}h
            </p>
            <p className="text-xs text-zinc-400">{periodTotalMinutes} minutos</p>
          </Card>
          <Card>
            <p className="text-sm text-zinc-500">Días incompletos</p>
            <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
              {incompleteDays}
            </p>
            {incompleteDays > 0 && (
              <p className="text-xs text-zinc-400">Faltan datos o hay un turno invertido</p>
            )}
          </Card>
        </div>
      )}

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
                    {canManage && (
                      <th className="px-4 py-3 text-right font-medium text-zinc-500">Acciones</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {days.map(({ record, day }) => {
                    return (
                      <tr
                        key={record.id}
                        className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-500">
                          <span className="flex items-center gap-2">
                            {formatDbDate(record.date)}
                            {record.isManual && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                Manual
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-500">{formatTime(record.morningIn)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-500">{formatTime(record.morningOut)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-500">{formatTime(record.afternoonIn)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-500">{formatTime(record.afternoonOut)}</td>
                        <td className="px-4 py-3 text-right">
                          <HoursBadge day={day} />
                        </td>
                        {canManage && (
                          <td className="px-4 py-3">
                            <AttendanceRowActions
                              record={record}
                              users={users}
                              canPickUser={canPickUser}
                              todayKey={todayKey}
                            />
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-3 sm:hidden">
            {days.map(({ record, day }) => {
              return (
                <Card key={record.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {formatDbDate(record.date)}
                        {record.isManual && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                            Manual
                          </span>
                        )}
                      </p>
                      <HoursBadge day={day} />
                    </div>
                    <div className="grid grid-cols-2 gap-3 border-t border-zinc-100 pt-3 text-xs dark:border-zinc-800">
                      <div>
                        <p className="text-zinc-500">Mañana</p>
                        <p className="mt-0.5 text-zinc-900 dark:text-zinc-100">
                          {formatShiftRange({
                            start: record.morningIn,
                            end: record.morningOut,
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-zinc-500">Tarde</p>
                        <p className="mt-0.5 text-zinc-900 dark:text-zinc-100">
                          {formatShiftRange({
                            start: record.afternoonIn,
                            end: record.afternoonOut,
                          })}
                        </p>
                      </div>
                    </div>
                    {canManage && (
                      <div className="border-t border-zinc-100 pt-3 dark:border-zinc-800">
                        <AttendanceRowActions
                          record={record}
                          users={users}
                          canPickUser={canPickUser}
                          todayKey={todayKey}
                        />
                      </div>
                    )}
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
