import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { getCurrentUser } from "@/app/src/lib/auth";
import {
  getAttendanceUsers,
  getTodayAttendance,
} from "@/app/src/lib/actions/attendance";
import {
  computeDayHours,
  formatHours,
  formatShiftRange,
  incompleteWarning,
} from "@/app/src/lib/attendance-hours";
import { canPickOtherUsers } from "@/app/src/lib/attendance-manual";
import { formatDateLong, getDateKey } from "@/app/src/lib/date-format";
import { AttendanceActions } from "./actions";
import { ManualAttendanceDialog } from "./manual-attendance-dialog";

export default async function AttendancePage() {
  const [user, attendance, users] = await Promise.all([
    getCurrentUser(),
    getTodayAttendance(),
    getAttendanceUsers(),
  ]);

  const today = formatDateLong(new Date());

  const day = computeDayHours({
    morningIn: attendance?.morningIn ?? null,
    morningOut: attendance?.morningOut ?? null,
    afternoonIn: attendance?.afternoonIn ?? null,
    afternoonOut: attendance?.afternoonOut ?? null,
  });

  const warning = incompleteWarning(day);

  return (
    <div className="max-w-2xl space-y-6">
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">
          Registro de Horas Prácticas
        </h2>
        <p className="text-sm text-zinc-500">{today}</p>
      </div>

      <ManualAttendanceDialog
        users={users}
        canPickUser={Boolean(user && canPickOtherUsers(user.role))}
        todayKey={getDateKey()}
      />

      <AttendanceActions attendance={attendance} />

      {warning && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {warning}. Ese turno todavía no se suma al total del día.
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Resumen del Día</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <ShiftCard
              title="🌅 Mañana"
              range={formatShiftRange({
                start: attendance?.morningIn ?? null,
                end: attendance?.morningOut ?? null,
              })}
              hours={day.morning.hours}
              open={day.morning.isOpen}
            />
            <ShiftCard
              title="🌆 Tarde"
              range={formatShiftRange({
                start: attendance?.afternoonIn ?? null,
                end: attendance?.afternoonOut ?? null,
              })}
              hours={day.afternoon.hours}
              open={day.afternoon.isOpen}
            />
          </div>

          <div className="rounded-lg bg-zinc-100 p-4 text-center dark:bg-zinc-800">
            <p className="text-sm text-zinc-500">Total del día</p>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
              {day.totalHours === null ? "--:-- h" : `${formatHours(day.totalHours)} h`}
            </p>
            {day.totalMinutes > 0 && (
              <p className="mt-1 text-xs text-zinc-500">{day.totalMinutes} minutos</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function ShiftCard({
  title,
  range,
  hours,
  open,
}: {
  title: string;
  range: string;
  hours: number | null;
  open: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        open
          ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20"
          : "border-zinc-200 dark:border-zinc-700"
      }`}
    >
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      <p className="mt-1 text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
        {range}
      </p>
      <p className="text-xs text-zinc-400">
        {open ? "Falta salida" : hours !== null ? `${formatHours(hours)} horas` : "Sin registro"}
      </p>
    </div>
  );
}
