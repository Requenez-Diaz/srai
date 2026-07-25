import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { getTodayAttendance } from "@/app/src/lib/actions/attendance";
import { AttendanceActions } from "./actions";

function formatTime(date: Date | null) {
  if (!date) return "--:--";
  return date.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function calcHours(start: Date | null, end: Date | null) {
  if (!start || !end) return null;
  return ((end.getTime() - start.getTime()) / (1000 * 60 * 60)).toFixed(1);
}

export default async function AttendancePage() {
  const attendance = await getTodayAttendance();
  const today = new Date().toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const morningHours = calcHours(attendance?.morningIn ?? null, attendance?.morningOut ?? null);
  const afternoonHours = calcHours(attendance?.afternoonIn ?? null, attendance?.afternoonOut ?? null);
  const totalHours =
    morningHours && afternoonHours
      ? (parseFloat(morningHours) + parseFloat(afternoonHours)).toFixed(1)
      : morningHours ?? afternoonHours ?? null;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Registro de Horas</h2>
        <p className="text-sm text-zinc-500">{today}</p>
      </div>

      <AttendanceActions attendance={attendance} />

      <Card>
        <CardHeader>
          <CardTitle>Resumen del Día</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <p className="text-sm font-medium text-zinc-500">🌅 Mañana</p>
              <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {formatTime(attendance?.morningIn ?? null)} →{" "}
                {formatTime(attendance?.morningOut ?? null)}
              </p>
              <p className="text-xs text-zinc-400">
                {morningHours ? `${morningHours} horas` : "Sin registro"}
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-700">
              <p className="text-sm font-medium text-zinc-500">🌆 Tarde</p>
              <p className="mt-1 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {formatTime(attendance?.afternoonIn ?? null)} →{" "}
                {formatTime(attendance?.afternoonOut ?? null)}
              </p>
              <p className="text-xs text-zinc-400">
                {afternoonHours ? `${afternoonHours} horas` : "Sin registro"}
              </p>
            </div>
          </div>
          {totalHours && (
            <div className="rounded-lg bg-zinc-100 p-4 text-center dark:bg-zinc-800">
              <p className="text-sm text-zinc-500">Total del día</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                {totalHours} horas
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
