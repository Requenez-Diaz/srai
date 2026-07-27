import { Card } from "@/app/src/components/ui/card";
import { Badge } from "@/app/src/components/ui/badge";
import { getAllAttendance } from "@/app/src/lib/actions/attendance";
import { getCurrentUser } from "@/app/src/lib/auth";
import { AttendanceModal } from "./attendance-modal";

function formatTime(date: Date | null) {
  if (!date) return "--:--";
  return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function calcHours(start: Date | null, end: Date | null) {
  if (!start || !end) return null;
  return ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1);
}

export default async function AttendanceHistoryPage() {
  const user = await getCurrentUser();
  const records = await getAllAttendance();

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
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Historial de Asistencia</h2>
        <p className="text-sm text-zinc-500">
          {user?.role === "SUPPORT" || user?.role === "ADMIN"
            ? "Registro de todos los practicantes"
            : "Tu historial de asistencia"}
        </p>
      </div>

      {records.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-zinc-500">No hay registros de asistencia</p>
        </Card>
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
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
                {records.map((record) => {
                  const morningHours = calcHours(record.morningIn, record.morningOut);
                  const afternoonHours = calcHours(record.afternoonIn, record.afternoonOut);
                  const total =
                    morningHours && afternoonHours
                      ? (parseFloat(morningHours) + parseFloat(afternoonHours)).toFixed(1)
                      : morningHours ?? afternoonHours ?? null;

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
                      <td className="px-4 py-3 text-zinc-500">
                        {record.date.toLocaleDateString("es-MX")}
                      </td>
                      <td className="px-4 py-3 text-zinc-500">{formatTime(record.morningIn)}</td>
                      <td className="px-4 py-3 text-zinc-500">{formatTime(record.morningOut)}</td>
                      <td className="px-4 py-3 text-zinc-500">{formatTime(record.afternoonIn)}</td>
                      <td className="px-4 py-3 text-zinc-500">{formatTime(record.afternoonOut)}</td>
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
      )}
    </div>
  );
}
