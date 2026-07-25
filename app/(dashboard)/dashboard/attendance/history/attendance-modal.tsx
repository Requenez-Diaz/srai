"use client";

import { useState } from "react";
import { useActionState } from "react";
import { Badge } from "@/app/src/components/ui/badge";
import { Button } from "@/app/src/components/ui/button";
import { getAttendanceByUser } from "@/app/src/lib/actions/attendance";
import { ExportPdfButton } from "./export-pdf-button";

type AttendanceRecord = {
  id: string;
  date: Date;
  morningIn: Date | null;
  morningOut: Date | null;
  afternoonIn: Date | null;
  afternoonOut: Date | null;
};

function formatTime(date: Date | null) {
  if (!date) return "--:--";
  return new Date(date).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" });
}

function calcHours(start: Date | null, end: Date | null) {
  if (!start || !end) return null;
  return ((new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60)).toFixed(1);
}

export function AttendanceModal({
  userId,
  userName,
  userRole,
}: {
  userId: string;
  userName: string;
  userRole: string;
}) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{
    records: AttendanceRecord[];
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPage = async (p: number) => {
    setLoading(true);
    const result = await getAttendanceByUser(userId, p);
    setData({ records: result.records, totalPages: result.totalPages });
    setPage(p);
    setLoading(false);
  };

  const handleOpen = async () => {
    setOpen(true);
    if (!data) await fetchPage(1);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="cursor-pointer font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
      >
        {userName}
      </button>
      <p className="text-xs text-zinc-400">{userRole}</p>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-10 mx-4 max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-700">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  Asistencia de {userName}
                </h3>
                <p className="text-sm text-zinc-500">{userRole}</p>
              </div>
              <div className="flex items-center gap-2">
                <ExportPdfButton userId={userId} />
                <button
                  onClick={() => setOpen(false)}
                  className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[60vh] p-6">
              {loading && !data ? (
                <p className="text-center text-sm text-zinc-500">Cargando...</p>
              ) : !data || data.records.length === 0 ? (
                <p className="text-center text-sm text-zinc-500">No hay registros de asistencia</p>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-700">
                        <th className="px-3 py-2 text-left font-medium text-zinc-500">Fecha</th>
                        <th className="px-3 py-2 text-left font-medium text-zinc-500">Entrada M.</th>
                        <th className="px-3 py-2 text-left font-medium text-zinc-500">Salida M.</th>
                        <th className="px-3 py-2 text-left font-medium text-zinc-500">Entrada T.</th>
                        <th className="px-3 py-2 text-left font-medium text-zinc-500">Salida T.</th>
                        <th className="px-3 py-2 text-left font-medium text-zinc-500">Horas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.records.map((record) => {
                        const morningHours = calcHours(record.morningIn, record.morningOut);
                        const afternoonHours = calcHours(record.afternoonIn, record.afternoonOut);
                        const total =
                          morningHours && afternoonHours
                            ? (parseFloat(morningHours) + parseFloat(afternoonHours)).toFixed(1)
                            : morningHours ?? afternoonHours ?? null;

                        return (
                          <tr
                            key={record.id}
                            className="border-b border-zinc-100 dark:border-zinc-800"
                          >
                            <td className="px-3 py-2 text-zinc-500">
                              {new Date(record.date).toLocaleDateString("es-MX")}
                            </td>
                            <td className="px-3 py-2 text-zinc-500">{formatTime(record.morningIn)}</td>
                            <td className="px-3 py-2 text-zinc-500">{formatTime(record.morningOut)}</td>
                            <td className="px-3 py-2 text-zinc-500">{formatTime(record.afternoonIn)}</td>
                            <td className="px-3 py-2 text-zinc-500">{formatTime(record.afternoonOut)}</td>
                            <td className="px-3 py-2">
                              {total ? (
                                <Badge variant="resolved">{total}h</Badge>
                              ) : (
                                <Badge variant="default">--</Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {data.totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={page <= 1 || loading}
                        onClick={() => fetchPage(page - 1)}
                      >
                        ← Anterior
                      </Button>
                      <span className="text-sm text-zinc-500">
                        {page} / {data.totalPages}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={page >= data.totalPages || loading}
                        onClick={() => fetchPage(page + 1)}
                      >
                        Siguiente →
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
