import type { ActivityType } from "@prisma/client";

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  FORO: "Foro",
  ACTO: "Acto",
  TALLER: "Taller",
  CONFERENCIA: "Conferencia",
  CAPACITACION: "Capacitación",
  OTRO: "Otro",
};

export const MONTH_LABELS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export const QUARTER_LABELS = [
  "Primer Trimestre (Ene - Mar)",
  "Segundo Trimestre (Abr - Jun)",
  "Tercer Trimestre (Jul - Sep)",
  "Cuarto Trimestre (Oct - Dic)",
];

export type PeriodKind = "monthly" | "quarterly";

export function canAccessReports(role: string) {
  return role === "SUPPORT" || role === "ADMIN";
}

export type ResolvedPeriod = {
  kind: PeriodKind;
  year: number;
  period: number;
  start: Date;
  end: Date;
  label: string;
  rangeLabel: string;
  shortLabel: string;
};

function clampInt(value: unknown, min: number, max: number, fallback: number) {
  const parsed = parseInt(String(value ?? ""), 10);
  if (isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export function resolvePeriod(input: {
  kind?: string;
  year?: string;
  period?: string;
}): ResolvedPeriod {
  const now = new Date();
  const kind: PeriodKind = input.kind === "quarterly" ? "quarterly" : "monthly";

  const year = clampInt(input.year, 2000, 2100, now.getFullYear());

  if (kind === "quarterly") {
    const period = clampInt(input.period, 1, 4, Math.floor(now.getMonth() / 3) + 1);
    const startMonthIndex = (period - 1) * 3;
    const start = new Date(year, startMonthIndex, 1);
    const end = new Date(year, startMonthIndex + 3, 1);

    return {
      kind,
      year,
      period,
      start,
      end,
      label: `${QUARTER_LABELS[period - 1]} ${year}`,
      shortLabel: `T${period} ${year}`,
      rangeLabel: `${start.toLocaleDateString("es-MX")} - ${new Date(
        end.getTime() - 1,
      ).toLocaleDateString("es-MX")}`,
    };
  }

  const period = clampInt(input.period, 1, 12, now.getMonth() + 1);
  const start = new Date(year, period - 1, 1);
  const end = new Date(year, period, 1);

  return {
    kind,
    year,
    period,
    start,
    end,
    label: `${MONTH_LABELS[period - 1]} ${year}`,
    shortLabel: `${MONTH_LABELS[period - 1]} ${year}`,
    rangeLabel: `${start.toLocaleDateString("es-MX")} - ${new Date(
      end.getTime() - 1,
    ).toLocaleDateString("es-MX")}`,
  };
}

export function getAvailableYears(extraYear?: number) {
  const current = new Date().getFullYear();
  const years = new Set<number>([current, current - 1, current - 2]);
  if (extraYear) years.add(extraYear);
  return [...years].sort((a, b) => b - a);
}

export function getPeriodOptions(kind: PeriodKind) {
  return kind === "quarterly" ? QUARTER_LABELS : MONTH_LABELS;
}
