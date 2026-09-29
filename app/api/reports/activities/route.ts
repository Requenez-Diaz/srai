import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { ACTIVITY_TYPE_LABELS, resolvePeriod } from "@/app/src/lib/activity-types";
import { getActivityReport } from "@/app/src/lib/actions/reports";

export const dynamic = "force-dynamic";

const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF18181B" },
};

const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
};

function styleHeader(row: ExcelJS.Row) {
  row.font = HEADER_FONT;
  row.fill = HEADER_FILL;
  row.alignment = { vertical: "middle", horizontal: "center" };
  row.height = 22;
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const report = await getActivityReport({
    kind: searchParams.get("kind") ?? undefined,
    year: searchParams.get("year") ?? undefined,
    period: searchParams.get("period") ?? undefined,
  });

  if (!report) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 403 },
    );
  }

  const { period, categories } = report;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "SRAI";
  workbook.created = report.generatedAt;

  const currencySafeNumber = (value: number) => value;

  // Hoja 1: resumen por categoría
  const summary = workbook.addWorksheet("Resumen por categoría", {
    views: [{ state: "frozen", ySplit: 5 }],
  });

  summary.columns = [
    { key: "title", width: 26 },
    { key: "count", width: 14 },
    { key: "percent", width: 14 },
    { key: "hours", width: 16 },
  ];

  summary.mergeCells("A1:D1");
  const titleCell = summary.getCell("A1");
  titleCell.value = "Reporte de Actividades por Tipo";
  titleCell.font = { bold: true, size: 14 };

  summary.mergeCells("A2:D2");
  summary.getCell("A2").value = `Período: ${period.label}`;
  summary.getCell("A2").font = { bold: true };

  summary.mergeCells("A3:D3");
  summary.getCell("A3").value = `Rango: ${period.rangeLabel}`;

  summary.mergeCells("A4:D4");
  summary.getCell("A4").value = `Generado: ${report.generatedAt.toLocaleString("es-MX")}`;

  const summaryHeader = summary.getRow(5);
  summaryHeader.values = ["Tipo de actividad", "Cantidad", "% del total", "Horas"];
  styleHeader(summaryHeader);

  report.byCategory.forEach((entry) => {
    const row = summary.addRow([
      entry.label,
      currencySafeNumber(entry.count),
      report.totals.activities
        ? round((entry.count / report.totals.activities) * 100)
        : 0,
      entry.hours,
    ]);
    row.getCell(2).numFmt = "0";
    row.getCell(3).numFmt = '0.0"%"';
    row.getCell(4).numFmt = "0.0";
  });

  const summaryTotal = summary.addRow([
    "TOTAL",
    report.totals.activities,
    report.totals.activities ? 100 : 0,
    report.totals.hours,
  ]);
  summaryTotal.font = { bold: true };
  summaryTotal.getCell(2).numFmt = "0";
  summaryTotal.getCell(3).numFmt = '0.0"%"';
  summaryTotal.getCell(4).numFmt = "0.0";
  summaryTotal.eachCell((cell) => {
    cell.border = { top: { style: "double" } };
  });

  summary.autoFilter = { from: "A5", to: "D5" };

  // Hoja 2: matriz persona x categoría
  const byPerson = workbook.addWorksheet("Por persona", {
    views: [{ state: "frozen", xSplit: 1, ySplit: 2 }],
  });

  byPerson.columns = [
    { key: "name", width: 34 },
    { key: "role", width: 16 },
    { key: "faculty", width: 22 },
    ...categories.map((type) => ({
      key: type,
      width: Math.max(12, ACTIVITY_TYPE_LABELS[type].length + 4),
    })),
    { key: "total", width: 14 },
    { key: "hours", width: 14 },
  ];

  byPerson.mergeCells(
    1,
    1,
    1,
    3 + categories.length + 2,
  );
  byPerson.getCell(1, 1).value = `Actividades por persona - ${period.label}`;
  byPerson.getCell(1, 1).font = { bold: true, size: 13 };

  const personHeader = byPerson.getRow(2);
  personHeader.values = [
    "Persona",
    "Rol",
    "Facultad",
    ...categories.map((type) => ACTIVITY_TYPE_LABELS[type]),
    "Total",
    "Horas",
  ];
  styleHeader(personHeader);

  report.byPerson.forEach((person) => {
    const row = byPerson.addRow([
      person.name,
      person.role,
      person.faculty ?? "-",
      ...categories.map((type) => person.counts[type] ?? 0),
      person.total,
      person.hours,
    ]);
    categories.forEach((_, index) => {
      row.getCell(4 + index).numFmt = "0";
    });
    row.getCell(3 + categories.length + 1).numFmt = "0";
    row.getCell(3 + categories.length + 2).numFmt = "0.0";
  });

  const peopleTotal = byPerson.addRow([
    "TOTAL",
    "",
    "",
    ...categories.map((type) => report.byCategory.find((c) => c.type === type)?.count ?? 0),
    report.totals.activities,
    report.totals.hours,
  ]);
  peopleTotal.font = { bold: true };
  categories.forEach((_, index) => {
    peopleTotal.getCell(4 + index).numFmt = "0";
  });
  peopleTotal.getCell(3 + categories.length + 1).numFmt = "0";
  peopleTotal.getCell(3 + categories.length + 2).numFmt = "0.0";
  peopleTotal.eachCell((cell) => {
    cell.border = { top: { style: "double" } };
  });

  // Hoja 3: detalle
  const detail = workbook.addWorksheet("Detalle", {
    views: [{ state: "frozen", ySplit: 2 }],
  });

  detail.columns = [
    { key: "start", width: 20 },
    { key: "type", width: 16 },
    { key: "title", width: 44 },
    { key: "location", width: 26 },
    { key: "organizer", width: 28 },
    { key: "end", width: 20 },
    { key: "hours", width: 12 },
  ];

  detail.mergeCells(1, 1, 1, 7);
  detail.getCell(1, 1).value = `Detalle de actividades - ${period.label}`;
  detail.getCell(1, 1).font = { bold: true, size: 13 };

  const detailHeader = detail.getRow(2);
  detailHeader.values = [
    "Fecha de inicio",
    "Tipo",
    "Título",
    "Ubicación",
    "Organizador",
    "Fecha de fin",
    "Horas",
  ];
  styleHeader(detailHeader);

  report.details.forEach((entry) => {
    const row = detail.addRow([
      entry.startDate,
      entry.typeLabel,
      entry.title,
      entry.location,
      entry.organizer,
      entry.endDate,
      entry.hours,
    ]);
    row.getCell(1).numFmt = "dd/mm/yyyy hh:mm";
    row.getCell(6).numFmt = "dd/mm/yyyy hh:mm";
    row.getCell(7).numFmt = "0.0";
  });

  const detailTotal = detail.addRow([
    "",
    "",
    "TOTAL",
    "",
    "",
    "",
    report.totals.hours,
  ]);
  detailTotal.font = { bold: true };
  detailTotal.getCell(7).numFmt = "0.0";
  detailTotal.eachCell((cell) => {
    cell.border = { top: { style: "double" } };
  });

  if (report.details.length > 0) {
    detail.autoFilter = { from: "A2", to: "G2" };
  }

  const buffer = await workbook.xlsx.writeBuffer();

  const fileName = `reporte_actividades_${resolvePeriod({
    kind: period.kind,
    year: String(period.year),
    period: String(period.period),
  }).shortLabel.replace(/\s+/g, "_")}.xlsx`;

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
