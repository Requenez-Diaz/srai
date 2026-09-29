import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { ISSUE_PRIORITY_LABELS, ISSUE_STATUS_LABELS } from "@/app/src/lib/activity-types";
import {
  getIssueReport,
  type IssueCategoryTotal,
  type IssuePersonTotal,
} from "@/app/src/lib/actions/reports";
import {
  addGroupedDetailSheet,
  round,
  styleHeader,
  writeTitleBlock,
} from "@/app/src/lib/reports/excel";

export const dynamic = "force-dynamic";

function addSummarySheet(
  workbook: ExcelJS.Workbook,
  options: {
    sheetName: string;
    title: string;
    periodLabel: string;
    rangeLabel: string;
    generatedAt: Date;
    groupLabel: string;
    entries: IssueCategoryTotal[];
    total: number;
    totalSuffix: string;
  },
) {
  const sheet = workbook.addWorksheet(options.sheetName, {
    views: [{ state: "frozen", xSplit: 1, ySplit: 5 }],
  });

  sheet.columns = [
    { key: "label", width: 26 },
    { key: "count", width: 12 },
    { key: "percent", width: 14 },
    { key: "names", width: 58 },
  ];

  writeTitleBlock(sheet, {
    title: options.title,
    periodLabel: options.periodLabel,
    rangeLabel: options.rangeLabel,
    generatedAt: options.generatedAt,
    columns: 4,
  });

  const header = sheet.getRow(5);
  header.values = [options.groupLabel, "Cantidad", "% del total", "Incidencias"];
  styleHeader(header);

  options.entries.forEach((entry) => {
    const row = sheet.addRow([
      entry.label,
      entry.count,
      options.total ? round((entry.count / options.total) * 100) : 0,
      entry.titles.join("\n") || "-",
    ]);
    row.getCell(2).numFmt = "0";
    row.getCell(3).numFmt = '0.0"%"';
    row.getCell(4).alignment = { vertical: "top", wrapText: true };
  });

  const totalRow = sheet.addRow([
    "TOTAL",
    options.total,
    options.total ? 100 : 0,
    options.totalSuffix,
  ]);
  totalRow.font = { bold: true };
  totalRow.getCell(2).numFmt = "0";
  totalRow.getCell(3).numFmt = '0.0"%"';
  totalRow.eachCell((cell) => {
    cell.border = { top: { style: "double" } };
  });

  sheet.autoFilter = { from: "A5", to: "D5" };
  return sheet;
}

function addPersonMatrixSheet(
  workbook: ExcelJS.Workbook,
  options: {
    sheetName: string;
    title: string;
    periodLabel: string;
    groups: { key: string; label: string }[];
    people: IssuePersonTotal[];
    total: number;
  },
) {
  const { groups } = options;
  const lastColumn = 3 + groups.length;

  const sheet = workbook.addWorksheet(options.sheetName, {
    views: [{ state: "frozen", xSplit: 1, ySplit: 2 }],
  });

  sheet.columns = [
    { key: "name", width: 34 },
    { key: "role", width: 16 },
    { key: "faculty", width: 22 },
    ...groups.map((group) => ({
      key: group.key,
      width: Math.max(12, group.label.length + 4),
    })),
    { key: "total", width: 12 },
  ];

  sheet.mergeCells(1, 1, 1, lastColumn);
  sheet.getCell(1, 1).value = `${options.title} - ${options.periodLabel}`;
  sheet.getCell(1, 1).font = { bold: true, size: 13 };

  const header = sheet.getRow(2);
  header.values = [
    "Persona",
    "Rol",
    "Facultad",
    ...groups.map((group) => group.label),
    "Total",
  ];
  styleHeader(header);

  options.people.forEach((person) => {
    const row = sheet.addRow([
      person.name,
      person.role,
      person.faculty ?? "-",
      ...groups.map((group) => person.counts[group.key] ?? 0),
      person.total,
    ]);
    groups.forEach((_, index) => {
      row.getCell(4 + index).numFmt = "0";
    });
    row.getCell(lastColumn).numFmt = "0";
  });

  const totalRow = sheet.addRow([
    "TOTAL",
    "",
    "",
    ...groups.map(
      (group) =>
        options.people.reduce((acc, person) => acc + (person.counts[group.key] ?? 0), 0),
    ),
    options.total,
  ]);
  totalRow.font = { bold: true };
  groups.forEach((_, index) => {
    totalRow.getCell(4 + index).numFmt = "0";
  });
  totalRow.getCell(lastColumn).numFmt = "0";
  totalRow.eachCell((cell) => {
    cell.border = { top: { style: "double" } };
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const report = await getIssueReport({
    kind: searchParams.get("kind") ?? undefined,
    year: searchParams.get("year") ?? undefined,
    period: searchParams.get("period") ?? undefined,
  });

  if (!report) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { period } = report;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SRAI";
  workbook.created = report.generatedAt;

  const statusGroups = report.statuses.map((status) => ({
    key: status,
    label: ISSUE_STATUS_LABELS[status],
  }));
  const priorityGroups = report.priorities.map((priority) => ({
    key: priority,
    label: ISSUE_PRIORITY_LABELS[priority],
  }));

  addSummarySheet(workbook, {
    sheetName: "Resumen por estado",
    title: "Reporte de Incidencias por Estado",
    periodLabel: period.label,
    rangeLabel: period.rangeLabel,
    generatedAt: report.generatedAt,
    groupLabel: "Estado",
    entries: report.byStatus,
    total: report.totals.issues,
    totalSuffix: `${report.totals.issues} incidencia(s) - ${report.totals.people} persona(s)`,
  });

  addSummarySheet(workbook, {
    sheetName: "Resumen por prioridad",
    title: "Reporte de Incidencias por Prioridad",
    periodLabel: period.label,
    rangeLabel: period.rangeLabel,
    generatedAt: report.generatedAt,
    groupLabel: "Prioridad",
    entries: report.byPriority,
    total: report.totals.issues,
    totalSuffix: `${report.totals.issues} incidencia(s) - ${report.totals.people} persona(s)`,
  });

  addPersonMatrixSheet(workbook, {
    sheetName: "Por persona (estado)",
    title: "Incidencias por persona (estado)",
    periodLabel: period.label,
    groups: statusGroups,
    people: report.byPersonStatus,
    total: report.totals.issues,
  });

  addPersonMatrixSheet(workbook, {
    sheetName: "Por persona (prioridad)",
    title: "Incidencias por persona (prioridad)",
    periodLabel: period.label,
    groups: priorityGroups,
    people: report.byPersonPriority,
    total: report.totals.issues,
  });

  const roleByName = new Map(report.byPersonStatus.map((person) => [person.name, person.role]));

  addGroupedDetailSheet(workbook, {
    sheetName: "Incidencias por persona",
    title: `Incidencias por persona y estado - ${period.label}`,
    periodLabel: period.label,
    rangeLabel: period.rangeLabel,
    generatedAt: report.generatedAt,
    groupLabels: ["Estado", "Prioridad"],
    entityLabel: "Incidencia",
    measureLabel: "Incidencias",
    rows: report.details.map((entry) => ({
      person: entry.reportedBy,
      role: roleByName.get(entry.reportedBy) ?? "",
      groupValues: [entry.statusLabel, entry.priorityLabel],
      name: entry.title,
      date: entry.createdAt,
      measure: 1,
    })),
  });

  const detail = workbook.addWorksheet("Detalle", {
    views: [{ state: "frozen", ySplit: 2 }],
  });

  detail.columns = [
    { key: "created", width: 20 },
    { key: "title", width: 44 },
    { key: "status", width: 16 },
    { key: "priority", width: 14 },
    { key: "location", width: 26 },
    { key: "reportedBy", width: 28 },
    { key: "assignedTo", width: 24 },
  ];

  detail.mergeCells(1, 1, 1, 7);
  detail.getCell(1, 1).value = `Detalle de incidencias - ${period.label}`;
  detail.getCell(1, 1).font = { bold: true, size: 13 };

  const detailHeader = detail.getRow(2);
  detailHeader.values = [
    "Fecha de reporte",
    "Incidencia",
    "Estado",
    "Prioridad",
    "Ubicación",
    "Reportada por",
    "Asignada a",
  ];
  styleHeader(detailHeader);

  report.details.forEach((entry) => {
    const row = detail.addRow([
      entry.createdAt,
      entry.title,
      entry.statusLabel,
      entry.priorityLabel,
      entry.location,
      entry.reportedBy,
      entry.assignedTo ?? "-",
    ]);
    row.getCell(1).numFmt = "dd/mm/yyyy hh:mm";
  });

  const detailTotal = detail.addRow([
    "",
    `TOTAL: ${report.totals.issues} incidencia(s)`,
    "",
    "",
    "",
    "",
    "",
  ]);
  detailTotal.font = { bold: true };
  detailTotal.eachCell((cell) => {
    cell.border = { top: { style: "double" } };
  });

  if (report.details.length > 0) {
    detail.autoFilter = { from: "A2", to: "G2" };
  }

  const buffer = await workbook.xlsx.writeBuffer();

  const fileName = `reporte_incidencias_${period.shortLabel.replace(/\s+/g, "_")}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
