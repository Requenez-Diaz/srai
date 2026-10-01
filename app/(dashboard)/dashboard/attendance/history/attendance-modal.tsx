"use client";

import { useState } from "react";
import { Badge } from "@/app/src/components/ui/badge";
import { Button } from "@/app/src/components/ui/button";
import { getAttendanceByUser } from "@/app/src/lib/actions/attendance";
import { computeDayHours, formatHours } from "@/app/src/lib/attendance-hours";
import { formatDate, formatTime } from "@/app/src/lib/date-format";
import { ExportPdfButton } from "./export-pdf-button";

type AttendanceRecord = {
  id: string;
  date: Date;
  morningIn: Date | null;
  morningOut: Date | null;
  afternoonIn: Date | null;
  afternoonOut: Date | null;
};

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
        className='cursor-pointer text-left font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400'
      >
        {userName}
      </button>
      <p className='text-xs text-zinc-400'>{userRole}</p>

      {open && (
        <div className='fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4'>
          <div
            className='fixed inset-0 bg-black/50'
            onClick={() => setOpen(false)}
          />
          <div className='relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-xl bg-white shadow-xl sm:max-h-[80vh] sm:rounded-xl dark:bg-zinc-900'>
            <div className='flex shrink-0 items-start justify-between gap-3 border-b border-zinc-200 px-4 py-4 sm:px-6 dark:border-zinc-700'>
              <div className='min-w-0'>
                <h3 className='truncate text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-50'>
                  Asistencia de {userName}
                </h3>
                <p className='text-sm text-zinc-500'>{userRole}</p>
              </div>
              <div className='flex shrink-0 items-center gap-2'>
                <ExportPdfButton userId={userId} />
                <button
                  onClick={() => setOpen(false)}
                  aria-label='Cerrar'
                  className='flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                >
                  ✕
                </button>
              </div>
            </div>

            <div className='overflow-y-auto p-4 sm:p-6'>
              {loading && !data ? (
                <p className='text-center text-sm text-zinc-500'>Cargando...</p>
              ) : !data || data.records.length === 0 ? (
                <p className='text-center text-sm text-zinc-500'>
                  No hay registros de asistencia
                </p>
              ) : (
                <>
                  <div className='overflow-x-auto'>
                    <table className='w-full min-w-[520px] text-sm'>
                      <thead>
                        <tr className='border-b border-zinc-200 dark:border-zinc-700'>
                          <th className='px-3 py-2 text-left font-medium text-zinc-500'>
                            Fecha
                          </th>
                          <th className='px-3 py-2 text-left font-medium text-zinc-500'>
                            Entrada M.
                          </th>
                          <th className='px-3 py-2 text-left font-medium text-zinc-500'>
                            Salida M.
                          </th>
                          <th className='px-3 py-2 text-left font-medium text-zinc-500'>
                            Entrada T.
                          </th>
                          <th className='px-3 py-2 text-left font-medium text-zinc-500'>
                            Salida T.
                          </th>
                          <th className='px-3 py-2 text-left font-medium text-zinc-500'>
                            Horas
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.records.map((record) => {
                          const day = computeDayHours(record);

                          return (
                            <tr
                              key={record.id}
                              className='border-b border-zinc-100 dark:border-zinc-800'
                            >
                              <td className='px-3 py-2 whitespace-nowrap text-zinc-500'>
                                {formatDate(record.date)}
                              </td>
                              <td className='px-3 py-2 whitespace-nowrap text-zinc-500'>
                                {day.morning.start
                                  ? formatTime(day.morning.start)
                                  : "--:--"}
                              </td>
                              <td className='px-3 py-2 whitespace-nowrap text-zinc-500'>
                                {day.morning.end
                                  ? formatTime(day.morning.end)
                                  : "--:--"}
                              </td>
                              <td className='px-3 py-2 whitespace-nowrap text-zinc-500'>
                                {day.afternoon.start
                                  ? formatTime(day.afternoon.start)
                                  : "--:--"}
                              </td>
                              <td className='px-3 py-2 whitespace-nowrap text-zinc-500'>
                                {day.afternoon.end
                                  ? formatTime(day.afternoon.end)
                                  : "--:--"}
                              </td>
                              <td className='px-3 py-2'>
                                {day.totalHours !== null ? (
                                  <Badge variant='resolved'>
                                    {formatHours(day.totalHours)}h
                                  </Badge>
                                ) : (
                                  <Badge variant='default'>--</Badge>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {data.totalPages > 1 && (
                    <div className='mt-4 flex flex-wrap items-center justify-center gap-2'>
                      <Button
                        variant='secondary'
                        size='sm'
                        disabled={page <= 1 || loading}
                        onClick={() => fetchPage(page - 1)}
                      >
                        ← Anterior
                      </Button>
                      <span className='text-sm text-zinc-500'>
                        {page} / {data.totalPages}
                      </span>
                      <Button
                        variant='secondary'
                        size='sm'
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
