/**
 * Formateo de fechas centralizado.
 *
 * Todas las fechas/horas se muestran en la zona horaria de Nicaragua
 * (America/Managua, UTC-6 todo el ano, sin horario de verano).
 *
 * Es importante fijar `timeZone` de forma explicita: sin ella, `toLocale*`
 * usa la zona del servidor, que en Vercel/Docker es UTC y mostraria las horas
 * con 6 horas de desfase (11:58 a.m. se veria como 05:58 p.m.).
 */
export const APP_TIME_ZONE = "America/Managua";

function toDate(value: Date | string | number | null | undefined): Date | null {
  if (value === null || value === undefined || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatTime(value: Date | string | null | undefined, withSeconds = false) {
  const date = toDate(value);
  if (!date) return "--:--";
  return date.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: withSeconds ? "2-digit" : undefined,
    timeZone: APP_TIME_ZONE,
  });
}

export function formatDate(value: Date | string | null | undefined) {
  const date = toDate(value);
  if (!date) return "--";
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: APP_TIME_ZONE,
  });
}

export function formatDateTime(value: Date | string | null | undefined) {
  const date = toDate(value);
  if (!date) return "--";
  return `${formatDate(date)}, ${formatTime(date)}`;
}

export function formatDateLong(value: Date | string | null | undefined) {
  const date = toDate(value);
  if (!date) return "";
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: APP_TIME_ZONE,
  });
}

/**
 * Clave de calendario "YYYY-MM-DD" del instante actual en la zona de la app.
 * Evita el desfase de un dia cuando el servidor corre en UTC.
 */
export function getDateKey(value: Date | string | null | undefined = new Date()) {
  const date = toDate(value ?? new Date());
  if (!date) return getDateKey(new Date());
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * Convierte la clave "YYYY-MM-DD" a un Date usable por Prisma en columnas
 * `@db.Date` (que guardan la parte de fecha en UTC).
 */
export function dateKeyToDbDate(key: string) {
  return new Date(`${key}T00:00:00.000Z`);
}

export function getTodayDbDate() {
  return dateKeyToDbDate(getDateKey());
}

/** Desfase de la zona respecto a UTC, en ms, para un instante dado. */
function zoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const map: Record<string, string> = {};
  for (const part of parts) map[part.type] = part.value;
  const asUtc = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour) % 24,
    Number(map.minute),
    Number(map.second),
  );
  return asUtc - date.getTime();
}

/**
 * Convierte una hora de reloj de la zona de la app al instante UTC
 * correspondiente. Se itera dos veces para resolver limites de DST.
 */
export function zonedToUtc(
  year: number,
  month: number,
  day = 1,
  hour = 0,
  minute = 0,
  second = 0,
  timeZone = APP_TIME_ZONE,
) {
  const wallClock = Date.UTC(year, month, day, hour, minute, second);
  let offset = zoneOffsetMs(new Date(wallClock), timeZone);
  let result = wallClock - offset;
  offset = zoneOffsetMs(new Date(result), timeZone);
  result = wallClock - offset;
  return new Date(result);
}

/** Instante de las 00:00 de la zona de la app para el mes dado (mes base 0). */
export function startOfZonedMonth(year: number, month: number) {
  return zonedToUtc(year, month, 1);
}

/** Año y mes (base 0) del instante actual en la zona de la app. */
export function getZonedYearMonth(date: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: APP_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "0";
  return { year: Number(get("year")), month: Number(get("month")) - 1 };
}
