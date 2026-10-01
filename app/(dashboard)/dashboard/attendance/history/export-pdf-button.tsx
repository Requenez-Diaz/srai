"use client";

import { useState } from "react";
import { Button } from "@/app/src/components/ui/button";
import { getAllAttendanceByUser } from "@/app/src/lib/actions/attendance";
import { computeDayHours, formatHours } from "@/app/src/lib/attendance-hours";
import { formatDbDate, formatDateLong, formatTime } from "@/app/src/lib/date-format";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function ExportPdfButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const { records, user } = await getAllAttendanceByUser(userId);
      if (!user || records.length === 0) {
        setLoading(false);
        return;
      }

      // Legal landscape: 215.9mm x 355.6mm
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "legal",
      });

      const pageWidth = doc.internal.pageSize.getWidth();

      const days = records.map((r) => ({ record: r, day: computeDayHours(r) }));
      const totalMinutes = days.reduce((acc, { day }) => acc + day.totalMinutes, 0);
      const incomplete = days.filter(({ day }) => day.hasOpenShift).length;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Reporte de Horas Prácticas", 14, 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Nombre: ${user.name}`, 14, 23);
      doc.text(`Email: ${user.email}`, 14, 29);
      doc.text(`Rol: ${user.role}`, 14, 35);
      doc.text(`Total de registros: ${records.length}`, 14, 41);
      doc.text(
        `Total de horas: ${formatHours(Math.round((totalMinutes / 60) * 100) / 100)} h (${totalMinutes} min)`,
        14,
        47,
      );
      doc.text(`D\u00edas incompletos: ${incomplete}`, 14, 53);

      const now = formatDateLong(new Date());
      doc.setFontSize(9);
      doc.text(`Generado el ${now}`, pageWidth - 14, 15, { align: "right" });

      const rows = days.map(({ record: r, day }) => [
        formatDbDate(r.date),
        formatTime(r.morningIn),
        formatTime(r.morningOut),
        formatTime(r.afternoonIn),
        formatTime(r.afternoonOut),
        day.totalHours === null ? "--" : formatHours(day.totalHours),
        day.hasOpenShift ? "Incompleto" : "",
      ]);

      autoTable(doc, {
        startY: 60,
        head: [
          ["Fecha", "Entrada M.", "Salida M.", "Entrada T.", "Salida T.", "Horas", "Estado"],
        ],
        body: rows,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [30, 30, 30] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 },
      });

      doc.save(`horas_practicas_${user.name.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
    }
    setLoading(false);
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={loading}
      onClick={handleExport}
      className="shrink-0"
    >
      {loading ? "Exportando..." : "Exportar PDF"}
    </Button>
  );
}
