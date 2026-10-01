import { dateKeyToDbDate, dbDateToDateKey, getDateKey, zonedToUtc } from "@/app/src/lib/date-format";
import { computeDayHours } from "@/app/src/lib/attendance-hours";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export type ManualShiftTimes = {
  morningIn: Date | null;
  morningOut: Date | null;
  afternoonIn: Date | null;
  afternoonOut: Date | null;
};

export type ManualAttendanceInput = ManualShiftTimes & {
  userId: string;
  dateKey: string;
};

export type ManualAttendanceResult =
  | { ok: true; value: ManualAttendanceInput }
  | { ok: false; error: string };

/**
 * El practicante solo puede tocar sus propios registros; soporte y admin
 * pueden tocar los de cualquiera.
 */
export function canManageAttendance(
  actor: { id: string; role: string },
  targetUserId: string,
) {
  return (
    actor.id === targetUserId ||
    actor.role === "SUPPORT" ||
    actor.role === "ADMIN"
  );
}

export function canPickOtherUsers(role: string) {
  return role === "SUPPORT" || role === "ADMIN";
}

/** "08:30" -> Date en el instante correcto de America/Managua. */
function timeOnDate(
  dateKey: string,
  time: string | null,
): Date | null | undefined {
  if (!time) return null;
  const match = TIME_RE.exec(time);
  if (!match) return undefined; // formato invalido
  const [year, month, day] = dateKey.split("-").map(Number);
  return zonedToUtc(year, month - 1, day, Number(match[1]), Number(match[2]));
}

/**
 * Valida el formulario de carga manual. Devuelve el primer error encontrado
 * con un mensaje pensado para mostrarse tal cual.
 */
export function parseManualAttendance(
  formData: FormData,
  fallbackUserId: string,
): ManualAttendanceResult {
  const userId = String(formData.get("userId") ?? "").trim() || fallbackUserId;
  const dateKey = String(formData.get("date") ?? "").trim();

  if (!dateKey) return { ok: false, error: "Selecciona la fecha del registro." };
  if (!DATE_RE.test(dateKey)) {
    return { ok: false, error: "La fecha no tiene un formato válido." };
  }

  const [y, m, d] = dateKey.split("-").map(Number);
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (
    probe.getUTCFullYear() !== y ||
    probe.getUTCMonth() !== m - 1 ||
    probe.getUTCDate() !== d
  ) {
    return { ok: false, error: "La fecha no existe en el calendario." };
  }

  if (dateKey > getDateKey()) {
    return {
      ok: false,
      error: "No se pueden registrar horas de fechas futuras. Usa el registro del día para marcar en vivo.",
    };
  }

  const raw = {
    morningIn: formData.get("morningIn"),
    morningOut: formData.get("morningOut"),
    afternoonIn: formData.get("afternoonIn"),
    afternoonOut: formData.get("afternoonOut"),
  } as Record<keyof ManualShiftTimes, FormDataEntryValue | null>;

  const times: ManualShiftTimes = { morningIn: null, morningOut: null, afternoonIn: null, afternoonOut: null };
  for (const key of Object.keys(times) as (keyof ManualShiftTimes)[]) {
    const value = raw[key] === null ? null : String(raw[key]).trim();
    const parsed = timeOnDate(dateKey, value);
    if (parsed === undefined) {
      return { ok: false, error: `El horario de "${key}" no es válido.` };
    }
    times[key] = parsed;
  }

  const hasMorning = times.morningIn !== null || times.morningOut !== null;
  const hasAfternoon = times.afternoonIn !== null || times.afternoonOut !== null;

  if (!hasMorning && !hasAfternoon) {
    return {
      ok: false,
      error: "Registra al menos un turno completo (entrada y salida).",
    };
  }

  if (hasMorning && (!times.morningIn || !times.morningOut)) {
    return {
      ok: false,
      error: "El turno de la mañana necesita entrada y salida, o deja ambos vacíos.",
    };
  }

  if (hasAfternoon && (!times.afternoonIn || !times.afternoonOut)) {
    return {
      ok: false,
      error: "El turno de la tarde necesita entrada y salida, o deja ambos vacíos.",
    };
  }

  if (
    times.morningIn &&
    times.morningOut &&
    times.morningOut <= times.morningIn
  ) {
    return {
      ok: false,
      error: "En la mañana, la salida debe ser posterior a la entrada.",
    };
  }

  if (
    times.afternoonIn &&
    times.afternoonOut &&
    times.afternoonOut <= times.afternoonIn
  ) {
    return {
      ok: false,
      error: "En la tarde, la salida debe ser posterior a la entrada.",
    };
  }

  if (
    times.morningOut &&
    times.afternoonIn &&
    times.afternoonIn < times.morningOut
  ) {
    return {
      ok: false,
      error: "La entrada de la tarde no puede ser antes de la salida de la mañana.",
    };
  }

  if (!userId) {
    return { ok: false, error: "Selecciona a qué practicante corresponden las horas." };
  }

  return { ok: true, value: { userId, dateKey, ...times } };
}

/** El dia debe sumar al menos 1 minuto para que el total tenga sentido. */
export function hasUsableTotal(times: ManualShiftTimes) {
  const day = computeDayHours(times);
  return day.totalMinutes > 0;
}

export function toDbDate(dateKey: string) {
  return dateKeyToDbDate(dateKey);
}

/** "YYYY-MM-DD" del registro, para comparar contra getDateKey(). */
export function dateKeyOf(value: Date) {
  return dbDateToDateKey(value);
}

/** "08:00" a partir de un Date guardado, para prellenar el formulario. */
export function timeValueOf(value: Date | null | undefined) {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Managua",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(value);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const hour = get("hour") === "24" ? "00" : get("hour");
  return `${hour}:${get("minute")}`;
}