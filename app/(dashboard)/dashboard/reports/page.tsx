import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/src/lib/auth";
import { getActivityReport, getIssueReport } from "@/app/src/lib/actions/reports";
import { Button } from "@/app/src/components/ui/button";
import {
  ACTIVITY_TYPE_LABELS,
  ISSUE_PRIORITY_LABELS,
  ISSUE_STATUS_LABELS,
  canAccessReports,
  type ResolvedPeriod,
} from "@/app/src/lib/activity-types";
import {
  CategoryBreakdown,
  DetailList,
  PeriodForm,
  PersonMatrix,
  StatCards,
  buildQuery,
} from "./report-parts";

const TABS = [
  { value: "actividades", label: "Actividades" },
  { value: "incidencias", label: "Incidencias" },
] as const;

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    kind?: string;
    year?: string;
    period?: string;
    reporte?: string;
  }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!canAccessReports(user.role)) redirect("/dashboard");

  const params = await searchParams;
  const tab = params.reporte === "incidencias" ? "incidencias" : "actividades";
  const query = { kind: params.kind, year: params.year, period: params.period };

  const header = (title: string, subtitle: string, p: ResolvedPeriod, tab: string) => (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-zinc-900 sm:text-2xl dark:text-zinc-50">
          {title}
        </h2>
        <p className="text-sm text-zinc-500">{subtitle}</p>
      </div>
      <a
        href={`/api/reports/${tab === "incidencias" ? "incidents" : "activities"}?${buildQuery(
          p.kind,
          p.year,
          p.period,
          tab,
        )}`}
        className="shrink-0 self-start sm:self-auto"
        data-testid="download-report"
      >
        <Button className="w-full sm:w-auto">Descargar Excel</Button>
      </a>
    </div>
  );

  const tabs = (p: ResolvedPeriod, current: string) => (
    <div className="flex gap-2 overflow-x-auto">
      {TABS.map((item) => {
        const isActive = item.value === current;
        return (
          <a
            key={item.value}
            href={`/dashboard/reports?${buildQuery(p.kind, p.year, p.period, item.value)}`}
            className={
              isActive
                ? "shrink-0 rounded-full bg-zinc-900 px-4 py-1.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "shrink-0 rounded-full border border-zinc-300 px-4 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }
          >
            {item.label}
          </a>
        );
      })}
    </div>
  );

  if (tab === "incidencias") {
    const report = await getIssueReport(query);
    if (!report) redirect("/dashboard");

    const { period } = report;

    return (
      <div className="space-y-6">
        {header(
          "Reportes de Incidencias",
          "Cantidad de incidencias por estado y prioridad, y por persona",
          period,
          tab,
        )}
        {tabs(period, tab)}

        <PeriodForm
          kind={period.kind}
          year={period.year}
          period={period.period}
          report={tab}
          rangeLabel={period.rangeLabel}
          periodLabel={period.label}
        />

        <StatCards
          items={[
            { label: "Incidencias reportadas", value: String(report.totals.issues) },
            { label: "Personas que reportaron", value: String(report.totals.people) },
            { label: "Pendientes / resueltas", value: `${report.totals.pending} / ${report.totals.resolved}` },
          ]}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <CategoryBreakdown
            title="Incidencias por estado"
            emptyText="No hay incidencias registradas en este período."
            total={report.totals.issues}
            entries={report.byStatus.map((entry) => ({
              key: entry.key,
              label: entry.label,
              count: entry.count,
              names: entry.titles,
            }))}
          />
          <CategoryBreakdown
            title="Incidencias por prioridad"
            emptyText="No hay incidencias registradas en este período."
            total={report.totals.issues}
            entries={report.byPriority.map((entry) => ({
              key: entry.key,
              label: entry.label,
              count: entry.count,
              names: entry.titles,
            }))}
          />
        </div>

        <PersonMatrix
          title="Incidencias por persona (estado)"
          emptyText="No hay incidencias registradas en este período."
          unit="inc."
          columns={report.statuses.map((status) => ({
            key: status,
            label: ISSUE_STATUS_LABELS[status],
          }))}
          people={report.byPersonStatus}
          columnTotals={report.statuses.map(
            (status) => report.byStatus.find((entry) => entry.key === status)?.count ?? 0,
          )}
          grandTotal={report.totals.issues}
        />

        <PersonMatrix
          title="Incidencias por persona (prioridad)"
          emptyText="No hay incidencias registradas en este período."
          unit="inc."
          columns={report.priorities.map((priority) => ({
            key: priority,
            label: ISSUE_PRIORITY_LABELS[priority],
          }))}
          people={report.byPersonPriority}
          columnTotals={report.priorities.map(
            (priority) => report.byPriority.find((entry) => entry.key === priority)?.count ?? 0,
          )}
          grandTotal={report.totals.issues}
        />

        <DetailList
          title="Detalle de incidencias"
          emptyText="No hay incidencias registradas en este período."
          items={report.details.map((entry) => ({
            id: entry.id,
            title: entry.title,
            href: `/dashboard/issues/${entry.id}`,
            subtitle: `${entry.createdAt.toLocaleString("es-MX")} · ${entry.location} · Reportada por ${entry.reportedBy}${entry.assignedTo ? ` · Asignada a ${entry.assignedTo}` : ""}`,
            badges: [entry.statusLabel, entry.priorityLabel],
            badgeTone: "default",
          }))}
        />
      </div>
    );
  }

  const report = await getActivityReport(query);
  if (!report) redirect("/dashboard");

  const { period } = report;

  return (
    <div className="space-y-6">
      {header(
        "Reportes de Actividades",
        "Cantidad de actividades por tipo y por persona",
        period,
        tab,
      )}
      {tabs(period, tab)}

      <PeriodForm
        kind={period.kind}
        year={period.year}
        period={period.period}
        report={tab}
        rangeLabel={period.rangeLabel}
        periodLabel={period.label}
      />

      <StatCards
        items={[
          { label: "Actividades realizadas", value: String(report.totals.activities) },
          { label: "Personas con actividades", value: String(report.totals.people) },
          { label: "Horas acumuladas", value: `${report.totals.hours}h` },
        ]}
      />

      <CategoryBreakdown
        title="Cantidad por tipo de actividad"
        emptyText="No hay actividades registradas en este período."
        total={report.totals.activities}
        entries={report.byCategory.map((entry) => ({
          key: entry.type,
          label: entry.label,
          count: entry.count,
          names: entry.titles,
          sublabel: `${entry.hours} horas`,
        }))}
      />

      <PersonMatrix
        title="Actividades por persona"
        emptyText="No hay actividades registradas en este período."
        unit="act."
        extraLabel="Horas"
        extraTotals={`${report.totals.hours}h`}
        columns={report.categories.map((type) => ({
          key: type,
          label: ACTIVITY_TYPE_LABELS[type],
        }))}
        people={report.byPerson.map((person) => ({
          userId: person.userId,
          name: person.name,
          role: person.role,
          faculty: person.faculty,
          counts: person.counts,
          total: person.total,
          extra: `${person.hours}h`,
        }))}
        columnTotals={report.categories.map(
          (type) => report.byCategory.find((entry) => entry.type === type)?.count ?? 0,
        )}
        grandTotal={report.totals.activities}
      />

      <DetailList
        title="Detalle de actividades"
        emptyText="No hay actividades registradas en este período."
        items={report.details.map((entry) => ({
          id: entry.id,
          title: entry.title,
          href: `/dashboard/activities/${entry.id}`,
          subtitle: `${entry.startDate.toLocaleString("es-MX")} · ${entry.location} · ${entry.organizer}`,
          badges: [entry.typeLabel, `${entry.hours}h`],
          badgeTone: "resolved",
        }))}
      />
    </div>
  );
}
