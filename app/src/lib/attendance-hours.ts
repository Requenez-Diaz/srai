const MS_PER_MINUTE = 60_000;

export type ShiftInput = {
  start: Date | string | null;
  end: Date | string | null;
};

export type ShiftResult = {
  start: Date | null;
  end: Date | null;
  minutes: number;
  hours: number | null;
  isOpen: boolean;
  isInverted: boolean;
  isIncomplete: boolean;
};

export type DayHoursResult = {
  morning: ShiftResult;
  afternoon: ShiftResult;
  totalMinutes: number;
  totalHours: number | null;
  hasOpenShift: boolean;
  missingCount: number;
};

export type AttendanceLike = {
  morningIn: Date | string | null;
  morningOut: Date | string | null;
  afternoonIn: Date | string | null;
  afternoonOut: Date | string | null;
};

function toDate(value: Date | string | null): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function analyzeShift(input: ShiftInput): ShiftResult {
  const start = toDate(input.start);
  const end = toDate(input.end);

  const rawMinutes =
    start && end ? Math.round((end.getTime() - start.getTime()) / MS_PER_MINUTE) : 0;

  const isOpen = !!start && !end;
  const isInverted = rawMinutes < 0;
  const isCountable = rawMinutes > 0;

  return {
    start,
    end,
    minutes: isCountable ? rawMinutes : 0,
    hours: isCountable ? round2(rawMinutes / 60) : null,
    isOpen,
    isInverted,
    isIncomplete: isOpen || isInverted,
  };
}

/**
 * Suma los turnos en minutos exactos y redondea una sola vez al final,
 * en lugar de redondear cada turno por separado (evita perder precision al acumular).
 * Un turno sin salida registrada no se cuenta, pero se marca como faltante.
 */
export function computeDayHours(record: AttendanceLike): DayHoursResult {
  const morning = analyzeShift({ start: record.morningIn, end: record.morningOut });
  const afternoon = analyzeShift({ start: record.afternoonIn, end: record.afternoonOut });

  const totalMinutes = morning.minutes + afternoon.minutes;

  return {
    morning,
    afternoon,
    totalMinutes,
    totalHours: totalMinutes > 0 ? round2(totalMinutes / 60) : null,
    hasOpenShift: morning.isOpen || afternoon.isOpen,
    missingCount: [morning, afternoon].filter((shift) => shift.isIncomplete).length,
  };
}

export function formatHours(hours: number | null, decimals = 2) {
  if (hours === null) return "--:--";
  return hours.toFixed(decimals);
}

export function formatTime(date: Date | string | null) {
  const parsed = toDate(date);
  if (!parsed) return "--:--";
  return parsed.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

export function formatShiftRange(input: ShiftInput) {
  return `${formatTime(input.start)} → ${formatTime(input.end)}`;
}

export function incompleteWarning(day: DayHoursResult) {
  if (day.morning.isOpen) return "Falta registrar salida de la mañana";
  if (day.afternoon.isOpen) return "Falta registrar salida de la tarde";
  if (day.morning.isInverted) return "La salida de la mañana es anterior a la entrada";
  if (day.afternoon.isInverted) return "La salida de la tarde es anterior a la entrada";
  return null;
}
