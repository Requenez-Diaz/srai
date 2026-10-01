import type ExcelJS from "exceljs";
import { formatDateTime } from "@/app/src/lib/date-format";

export const HEADER_FILL: ExcelJS.Fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF18181B" },
};

export const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true,
  color: { argb: "FFFFFFFF" },
};

export function styleHeader(row: ExcelJS.Row) {
  row.font = HEADER_FONT;
  row.fill = HEADER_FILL;
  row.alignment = { vertical: "middle", horizontal: "center" };
  row.height = 22;
}

export function round(value: number) {
  return Math.round(value * 10) / 10;
}

export function writeTitleBlock(
  sheet: ExcelJS.Worksheet,
  options: {
    title: string;
    periodLabel: string;
    rangeLabel: string;
    generatedAt: Date;
    columns: number;
  },
) {
  sheet.mergeCells(1, 1, 1, options.columns);
  const title = sheet.getCell(1, 1);
  title.value = options.title;
  title.font = { bold: true, size: 14 };

  sheet.mergeCells(2, 1, 2, options.columns);
  const period = sheet.getCell(2, 1);
  period.value = `Período: ${options.periodLabel}`;
  period.font = { bold: true };

  sheet.mergeCells(3, 1, 3, options.columns);
  sheet.getCell(3, 1).value = `Rango: ${options.rangeLabel}`;

  sheet.mergeCells(4, 1, 4, options.columns);
  sheet.getCell(4, 1).value = `Generado: ${formatDateTime(options.generatedAt)}`;
}

export type GroupedRow = {
  person: string;
  role: string;
  groupValues: string[];
  name: string;
  date: Date;
  measure: number;
};

/**
 * Hoja con una fila por registro (actividad o incidencia) agrupada por persona
 * y por categoría, con subtotales por persona y un total general al final.
 */
export function addGroupedDetailSheet(
  workbook: ExcelJS.Workbook,
  options: {
    sheetName: string;
    title: string;
    periodLabel: string;
    rangeLabel: string;
    generatedAt: Date;
    groupLabels: string[];
    entityLabel: string;
    measureLabel: string;
    rows: GroupedRow[];
  },
) {
  const { rows, groupLabels } = options;
  // persona | rol | <grupos> | nombre | fecha | medida
  const columns = 5 + groupLabels.length;
  const nameColumn = 3 + groupLabels.length;
  const dateColumn = 4 + groupLabels.length;
  const measureColumn = 5 + groupLabels.length;

  const sheet = workbook.addWorksheet(options.sheetName, {
    views: [{ state: "frozen", xSplit: 1, ySplit: 2 }],
  });

  sheet.columns = [
    { key: "person", width: 32 },
    { key: "role", width: 16 },
    ...groupLabels.map((label) => ({
      key: label,
      width: Math.max(14, label.length + 6),
    })),
    { key: "name", width: 46 },
    { key: "date", width: 20 },
    { key: "measure", width: 14 },
  ];

  writeTitleBlock(sheet, {
    title: options.title,
    periodLabel: options.periodLabel,
    rangeLabel: options.rangeLabel,
    generatedAt: options.generatedAt,
    columns,
  });

  const header = sheet.getRow(5);
  header.values = [
    "Persona",
    "Rol",
    ...groupLabels,
    options.entityLabel,
    "Fecha",
    options.measureLabel,
  ];
  styleHeader(header);

  const sorted = [...rows].sort(
    (a, b) =>
      a.person.localeCompare(b.person) ||
      a.groupValues.join("|").localeCompare(b.groupValues.join("|")) ||
      a.date.getTime() - b.date.getTime(),
  );

  let currentPerson: string | null = null;
  let personTotal = 0;
  let grandTotal = 0;

  const addTotalRow = (label: string, value: number, top: "thin" | "double") => {
    const row = sheet.addRow([label, "", ...new Array<string>(columns - 2).fill("")]);
    row.getCell(measureColumn).value = value;
    row.font = { bold: true };
    row.getCell(measureColumn).numFmt = options.measureLabel === "Horas" ? "0.0" : "0";
    row.eachCell((cell) => {
      cell.border = { top: { style: top } };
    });
    return row;
  };

  sorted.forEach((entry) => {
    if (entry.person !== currentPerson) {
      if (currentPerson !== null) {
        addTotalRow(`Total ${currentPerson}`, round(personTotal), "thin");
      }
      currentPerson = entry.person;
      personTotal = 0;
    }

    const row = sheet.addRow([
      entry.person,
      entry.role,
      ...entry.groupValues,
      entry.name,
      entry.date,
      round(entry.measure),
    ]);
    row.getCell(nameColumn).alignment = { vertical: "top", wrapText: true };
    row.getCell(dateColumn).numFmt = "dd/mm/yyyy hh:mm";
    row.getCell(measureColumn).numFmt = options.measureLabel === "Horas" ? "0.0" : "0";

    personTotal += entry.measure;
    grandTotal += entry.measure;
  });

  if (currentPerson !== null) {
    addTotalRow(`Total ${currentPerson}`, round(personTotal), "thin");
  }

  addTotalRow("TOTAL GENERAL", round(grandTotal), "double");

  if (rows.length > 0) {
    sheet.autoFilter = { from: "A5", to: sheet.getRow(5).getCell(columns).address.split(":")[0] };
  }
  return sheet;
}
