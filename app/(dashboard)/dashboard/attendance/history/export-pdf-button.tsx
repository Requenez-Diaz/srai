"use client";

import { useState } from "react";
import { Button } from "@/app/src/components/ui/button";
import { getAllAttendanceByUser } from "@/app/src/lib/actions/attendance";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function formatTime(date: Date | string | null) {
  if (!date) return "--:--";
  return new Date(date).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function calcHours(start: Date | string | null, end: Date | string | null) {
  if (!start || !end) return null;
  return ((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60)).toFixed(1);
}

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

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("Reporte de Asistencia", 14, 15);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.text(`Nombre: ${user.name}`, 14, 23);
      doc.text(`Email: ${user.email}`, 14, 29);
      doc.text(`Rol: ${user.role}`, 14, 35);
      doc.text(`Total de registros: ${records.length}`, 14, 41);

      const now = new Date().toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.setFontSize(9);
      doc.text(`Generado el ${now}`, pageWidth - 14, 15, { align: "right" });

      const rows = records.map((r) => {
        const morningHours = calcHours(r.morningIn, r.morningOut);
        const afternoonHours = calcHours(r.afternoonIn, r.afternoonOut);
        const total =
          morningHours && afternoonHours
            ? (parseFloat(morningHours) + parseFloat(afternoonHours)).toFixed(1)
            : morningHours ?? afternoonHours ?? "--";

        return [
          new Date(r.date).toLocaleDateString("es-MX"),
          formatTime(r.morningIn),
          formatTime(r.morningOut),
          formatTime(r.afternoonIn),
          formatTime(r.afternoonOut),
          `${total}h`,
        ];
      });

      autoTable(doc, {
        startY: 47,
        head: [["Fecha", "Entrada M.", "Salida M.", "Entrada T.", "Salida T.", "Horas"]],
        body: rows,
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [30, 30, 30] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { left: 14, right: 14 },
      });

      doc.save(`asistencia_${user.name.replace(/\s+/g, "_")}.pdf`);
    } catch (error) {
      console.error("Error generando PDF:", error);
    }
    setLoading(false);
  };

  return (
    <Button variant="secondary" size="sm" disabled={loading} onClick={handleExport}>
      {loading ? "Exportando..." : "Exportar PDF"}
    </Button>
  );
}
