import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { Badge } from "@/app/src/components/ui/badge";
import { Button } from "@/app/src/components/ui/button";
import {
  getAvailableYears,
  getPeriodOptions,
  type PeriodKind,
} from "@/app/src/lib/activity-types";

export function buildQuery(
  kind: PeriodKind,
  year: number,
  period: number,
  report: string,
) {
  return new URLSearchParams({
    kind,
    year: String(year),
    period: String(period),
    reporte: report,
  }).toString();
}

export function PeriodForm({
  kind,
  year,
  period,
  report,
  rangeLabel,
  periodLabel,
}: {
  kind: PeriodKind;
  year: number;
  period: number;
  report: string;
  rangeLabel: string;
  periodLabel: string;
}) {
  const selectClass =
    "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Período del reporte</CardTitle>
      </CardHeader>
      <form method="get" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <input type="hidden" name="reporte" value={report} />

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Tipo de período
          </label>
          <select name="kind" defaultValue={kind} className={selectClass}>
            <option value="monthly">Mensual</option>
            <option value="quarterly">Trimestral</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {kind === "quarterly" ? "Trimestre" : "Mes"}
          </label>
          <select
            key={`${kind}-${year}`}
            name="period"
            defaultValue={String(period)}
            className={selectClass}
          >
            {getPeriodOptions(kind).map((option, index) => (
              <option key={option} value={index + 1}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Año</label>
          <select name="year" defaultValue={String(year)} className={selectClass}>
            {getAvailableYears(year).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-3">
          <Button type="submit" className="w-full sm:w-auto">
            Aplicar
          </Button>
        </div>
      </form>

      <p className="mt-4 text-sm text-zinc-500">
        Periodo seleccionado:{" "}
        <span className="font-medium text-zinc-900 dark:text-zinc-50">{periodLabel}</span> (
        {rangeLabel})
      </p>
    </Card>
  );
}

export function StatCards({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <p className="text-sm text-zinc-500">{item.label}</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {item.value}
          </p>
        </Card>
      ))}
    </div>
  );
}

export type BreakdownEntry = {
  key: string;
  label: string;
  count: number;
  names: string[];
  sublabel?: string;
};

export function CategoryBreakdown({
  title,
  emptyText,
  total,
  entries,
}: {
  title: string;
  emptyText: string;
  total: number;
  entries: BreakdownEntry[];
}) {
  const maxCount = Math.max(1, ...entries.map((entry) => entry.count));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {total === 0 ? (
        <p className="text-sm text-zinc-500">{emptyText}</p>
      ) : (
        <ul className="space-y-4">
          {entries.map((entry) => {
            const percent = total ? Math.round((entry.count / total) * 100) : 0;
            return (
              <li key={entry.key} className="space-y-1">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-zinc-700 dark:text-zinc-300">
                    {entry.label}
                  </span>
                  <span className="shrink-0 font-medium text-zinc-900 dark:text-zinc-50">
                    {entry.count} ({percent}%)
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100"
                    style={{ width: `${(entry.count / maxCount) * 100}%` }}
                  />
                </div>
                {entry.sublabel && <p className="text-xs text-zinc-400">{entry.sublabel}</p>}
                {entry.names.length > 0 && (
                  <ul className="space-y-0.5 pt-1 text-xs text-zinc-500">
                    {entry.names.map((name) => (
                      <li key={name} className="truncate">
                        · {name}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

export type MatrixColumn = { key: string; label: string };

export type MatrixPerson = {
  userId: string;
  name: string;
  role: string;
  faculty: string | null;
  counts: Record<string, number>;
  total: number;
  extra?: string;
};

export function PersonMatrix({
  title,
  emptyText,
  columns,
  people,
  columnTotals,
  grandTotal,
  extraLabel,
  extraTotals,
  unit = "act.",
}: {
  title: string;
  emptyText: string;
  columns: MatrixColumn[];
  people: MatrixPerson[];
  columnTotals: number[];
  grandTotal: number;
  extraLabel?: string;
  extraTotals?: string;
  unit?: string;
}) {
  if (people.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <p className="text-sm text-zinc-500">{emptyText}</p>
      </Card>
    );
  }

  const maxTotal = Math.max(1, ...people.map((person) => person.total));
  const allColumns = [...columns, ...(extraLabel ? [{ key: "__extra", label: extraLabel }] : [])];
  const lastHeader = allColumns[allColumns.length - 1].label;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-3 py-3 text-left font-medium text-zinc-500">Persona</th>
              <th className="px-3 py-3 text-left font-medium text-zinc-500">Rol</th>
              {allColumns.map((column) => (
                <th key={column.key} className="px-3 py-3 text-right font-medium text-zinc-500">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.userId} className="border-b border-zinc-100 dark:border-zinc-800">
                <td className="px-3 py-3">
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">{person.name}</p>
                  {person.faculty && <p className="text-xs text-zinc-500">{person.faculty}</p>}
                </td>
                <td className="px-3 py-3">
                  <Badge variant="default">{person.role}</Badge>
                </td>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-3 py-3 text-right text-zinc-700 dark:text-zinc-300"
                  >
                    {person.counts[column.key] ?? 0}
                  </td>
                ))}
                {extraLabel && (
                  <td className="px-3 py-3 text-right text-zinc-700 dark:text-zinc-300">
                    {person.extra}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-zinc-200 dark:border-zinc-800">
              <td className="px-3 py-3 font-semibold text-zinc-900 dark:text-zinc-50">TOTAL</td>
              <td className="px-3 py-3" />
              {columnTotals.map((value, index) => (
                <td
                  key={allColumns[index].key}
                  className="px-3 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-50"
                >
                  {value}
                </td>
              ))}
              {extraLabel && (
                <td className="px-3 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-50">
                  {extraTotals}
                </td>
              )}
            </tr>
          </tfoot>
        </table>
        <p className="mt-2 text-xs text-zinc-400">
          Total general: {grandTotal} {lastHeader === "Horas" ? "horas" : unit}
        </p>
      </div>

      <div className="space-y-3 sm:hidden">
        {people.map((person) => (
          <div key={person.userId} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                  {person.name}
                </p>
                <p className="text-xs text-zinc-500">{person.role}</p>
              </div>
              <Badge variant="default">{person.total} {unit}</Badge>
            </div>
            <div className="mt-3 space-y-1">
              {columns.map((column) => {
                const count = person.counts[column.key] ?? 0;
                if (!count) return null;
                return (
                  <div key={column.key} className="flex items-center justify-between gap-3 text-xs">
                    <span className="truncate text-zinc-500">{column.label}</span>
                    <span className="shrink-0 font-medium text-zinc-900 dark:text-zinc-50">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
            {extraLabel && (
              <p className="mt-2 text-xs text-zinc-500">
                {extraLabel}: {person.extra}
              </p>
            )}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100"
                style={{ width: `${(person.total / maxTotal) * 100}%` }}
              />
            </div>
          </div>
        ))}
        <p className="text-xs text-zinc-400">
          TOTAL: {grandTotal} {lastHeader === "Horas" ? "horas" : unit}
        </p>
      </div>
    </Card>
  );
}

export function DetailList({
  title,
  emptyText,
  items,
}: {
  title: string;
  emptyText: string;
  items: {
    id: string;
    title: string;
    subtitle: string;
    badges: string[];
    badgeTone?: "default" | "resolved";
    href: string;
  }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {items.length === 0 ? (
        <p className="text-sm text-zinc-500">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {items.map((item) => (
            <li key={item.id} className="py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <Link
                    href={item.href}
                    className="font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-400"
                  >
                    {item.title}
                  </Link>
                  <p className="text-xs text-zinc-500">{item.subtitle}</p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {item.badges.map((badge, index) => (
                    <Badge
                      key={badge + index}
                      variant={index === 0 ? "default" : (item.badgeTone ?? "default")}
                    >
                      {badge}
                    </Badge>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
