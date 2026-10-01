import { Card } from "@/app/src/components/ui/card";
import { getAllAttendance } from "@/app/src/lib/actions/attendance";
import { getCurrentUser } from "@/app/src/lib/auth";
import {
  computeDayHours,
  formatShiftRange,
  formatTime,
} from "@/app/src/lib/attendance-hours";
import { formatDate } from "@/app/src/lib/date-format";
import { AttendanceModal } from "./attendance-modal";
import { HoursBadge } from "../hours-badge";

export default async function AttendanceHistoryPage() {
  const user = await getCurrentUser();
  const records = await getAllAttendance();

  const days = records.map((record) => ({ record, day: computeDayHours(record) }));

  const roleLabel = (role: string) => {
    const map: Record<string, string> = {
      PRACTICANTE: "Practicante",
      STUDENT: "Estudiante",
      TEACHER: "Docente",
      SUPPORT: "Soporte",
      ADMIN: "Admin",
    };
    return map[role] ?? role;
  };

  return (
    <div className="space-y-6">
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">
          Historial de Horas Prácticas
        </h2>
        <p className="text-sm text-zinc-500">
          {user?.role === "SUPPORT" || user?.role === "ADMIN"
            ? "Registro de horas prácticas de todos los practicantes"
            : "Tu historial de horas prácticas"}
        </p>
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
                    {(user?.role === "SUPPORT" || user?.role === "ADMIN") && (
                      <th className="px-4 py-3 text-left font-medium text-zinc-500">Nombre</th>
                    )}
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Fecha</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Entrada M.</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Salida M.</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Entrada T.</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Salida T.</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Horas</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map(({ record, day }) => {
                    return (
                      <tr
                        key={record.id}
                        className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                      >
                        {(user?.role === "SUPPORT" || user?.role === "ADMIN") && (
                          <td className="px-4 py-3">
                            <AttendanceModal
                              userId={record.user.id}
                              userName={record.user.name}
                              userRole={roleLabel(record.user.role)}
                            />
                          </td>
                        )}
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-500">
                          {formatDate(record.date)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-500">{formatTime(record.morningIn)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-500">{formatTime(record.morningOut)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-500">{formatTime(record.afternoonIn)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-zinc-500">{formatTime(record.afternoonOut)}</td>
                        <td className="px-4 py-3 text-right">
                          <HoursBadge day={day} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          <div className="space-y-3 sm:hidden">
            {days.map(({ record, day }) => {
              const showUser = user?.role === "SUPPORT" || user?.role === "ADMIN";

              return (
                <Card key={record.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        {showUser && (
                          <AttendanceModal
                            userId={record.user.id}
                            userName={record.user.name}
                            userRole={roleLabel(record.user.role)}
                          />
                        )}
                        <p className="text-xs text-zinc-500">
                          {formatDate(record.date)}
                        </p>
                      </div>
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
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
