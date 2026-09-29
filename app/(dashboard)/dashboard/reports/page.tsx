import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/src/lib/auth";
import { getActivityReport } from "@/app/src/lib/actions/reports";
import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { Badge } from "@/app/src/components/ui/badge";
import { Button } from "@/app/src/components/ui/button";
import {
  ACTIVITY_TYPE_LABELS,
  canAccessReports,
  getAvailableYears,
  getPeriodOptions,
  type PeriodKind,
} from "@/app/src/lib/activity-types";

function buildQuery(kind: PeriodKind, year: number, period: number) {
  const params = new URLSearchParams({
    kind,
    year: String(year),
    period: String(period),
  });
  return params.toString();
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    kind?: string;
    year?: string;
    period?: string;
  }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canAccessReports(user.role)) redirect("/dashboard");

  const params = await searchParams;
  const report = await getActivityReport(params);
  if (!report) redirect("/dashboard");

  const { period } = report;
  const periodOptions = getPeriodOptions(period.kind);
  const years = getAvailableYears(period.year);
  const currentQuery = buildQuery(period.kind, period.year, period.period);
  const downloadHref = `/api/reports/activities?${currentQuery}`;

  const maxCount = Math.max(1, ...report.byCategory.map((entry) => entry.count));
  const maxPersonCount = Math.max(1, ...report.byPerson.map((p) => p.total));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">
            Reportes de Actividades
          </h2>
          <p className="text-sm text-zinc-500">
            Cantidad de actividades por tipo y por persona
          </p>
        </div>
        <a
          href={downloadHref}
          className="shrink-0 self-start sm:self-auto"
          data-testid="download-report"
        >
          <Button className="w-full sm:w-auto">Descargar Excel</Button>
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Período del reporte</CardTitle>
        </CardHeader>
        <form method="get" className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Tipo de período
            </label>
            <select
              name="kind"
              defaultValue={period.kind}
              className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {period.kind === "quarterly" ? "Trimestre" : "Mes"}
            </label>
            <select
              key={`${period.kind}-${period.year}`}
              name="period"
              defaultValue={String(period.period)}
              className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {periodOptions.map((option, index) => (
                <option key={option} value={index + 1}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Año
            </label>
            <select
              name="year"
              defaultValue={String(period.year)}
              className="w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 sm:text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
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
          Periodo seleccionado: <span className="font-medium text-zinc-900 dark:text-zinc-50">{period.label}</span>{" "}
          ({period.rangeLabel})
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-zinc-500">Actividades realizadas</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {report.totals.activities}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Personas con actividades</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {report.totals.people}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-zinc-500">Horas acumuladas</p>
          <p className="mt-1 text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            {report.totals.hours}h
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Cantidad por tipo de actividad</CardTitle>
        </CardHeader>
        {report.totals.activities === 0 ? (
          <p className="text-sm text-zinc-500">
            No hay actividades registradas en este período.
          </p>
        ) : (
          <ul className="space-y-4">
            {report.byCategory.map((entry) => {
              const percent = report.totals.activities
                ? Math.round((entry.count / report.totals.activities) * 100)
                : 0;
              return (
                <li key={entry.type} className="space-y-1">
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
                  <p className="text-xs text-zinc-400">{entry.hours} horas</p>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actividades por persona</CardTitle>
        </CardHeader>
        {report.byPerson.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No hay actividades registradas en este período.
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800">
                    <th className="px-3 py-3 text-left font-medium text-zinc-500">
                      Persona
                    </th>
                    <th className="px-3 py-3 text-left font-medium text-zinc-500">
                      Rol
                    </th>
                    {report.categories.map((type) => (
                      <th
                        key={type}
                        className="px-3 py-3 text-right font-medium text-zinc-500"
                      >
                        {ACTIVITY_TYPE_LABELS[type]}
                      </th>
                    ))}
                    <th className="px-3 py-3 text-right font-medium text-zinc-500">
                      Total
                    </th>
                    <th className="px-3 py-3 text-right font-medium text-zinc-500">
                      Horas
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {report.byPerson.map((person) => (
                    <tr
                      key={person.userId}
                      className="border-b border-zinc-100 dark:border-zinc-800"
                    >
                      <td className="px-3 py-3">
                        <p className="font-medium text-zinc-900 dark:text-zinc-50">
                          {person.name}
                        </p>
                        {person.faculty && (
                          <p className="text-xs text-zinc-500">{person.faculty}</p>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <Badge variant="default">{person.role}</Badge>
                      </td>
                      {report.categories.map((type) => (
                        <td
                          key={type}
                          className="px-3 py-3 text-right text-zinc-700 dark:text-zinc-300"
                        >
                          {person.counts[type] ?? 0}
                        </td>
                      ))}
                      <td className="px-3 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-50">
                        {person.total}
                      </td>
                      <td className="px-3 py-3 text-right text-zinc-700 dark:text-zinc-300">
                        {person.hours}h
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-zinc-200 dark:border-zinc-800">
                    <td className="px-3 py-3 font-semibold text-zinc-900 dark:text-zinc-50">
                      TOTAL
                    </td>
                    <td className="px-3 py-3" />
                    {report.categories.map((type) => (
                      <td
                        key={type}
                        className="px-3 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-50"
                      >
                        {report.byCategory.find((c) => c.type === type)?.count ?? 0}
                      </td>
                    ))}
                    <td className="px-3 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-50">
                      {report.totals.activities}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-zinc-900 dark:text-zinc-50">
                      {report.totals.hours}h
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="space-y-3 sm:hidden">
              {report.byPerson.map((person) => (
                <div
                  key={person.userId}
                  className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-900 dark:text-zinc-50">
                        {person.name}
                      </p>
                      <p className="text-xs text-zinc-500">{person.role}</p>
                    </div>
                    <Badge variant="default">{person.total} act.</Badge>
                  </div>
                  <div className="mt-3 space-y-1">
                    {report.categories.map((type) => {
                      const count = person.counts[type] ?? 0;
                      if (!count) return null;
                      return (
                        <div
                          key={type}
                          className="flex items-center justify-between gap-3 text-xs"
                        >
                          <span className="truncate text-zinc-500">
                            {ACTIVITY_TYPE_LABELS[type]}
                          </span>
                          <span className="shrink-0 font-medium text-zinc-900 dark:text-zinc-50">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100"
                      style={{ width: `${(person.total / maxPersonCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de actividades</CardTitle>
        </CardHeader>
        {report.details.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No hay actividades registradas en este período.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {report.details.map((entry) => (
              <li key={entry.id} className="py-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/activities/${entry.id}`}
                      className="font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-50 dark:hover:text-zinc-400"
                    >
                      {entry.title}
                    </Link>
                    <p className="text-xs text-zinc-500">
                      {entry.startDate.toLocaleString("es-MX")} · {entry.location} ·{" "}
                      {entry.organizer}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Badge variant="default">{entry.typeLabel}</Badge>
                    <Badge variant="resolved">{entry.hours}h</Badge>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
