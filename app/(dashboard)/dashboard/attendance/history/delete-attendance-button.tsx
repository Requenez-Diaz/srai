"use client";

import { useState } from "react";
import { Button } from "@/app/src/components/ui/button";
import { deleteAttendanceRecord } from "@/app/src/lib/actions/attendance";
import { formatDbDate } from "@/app/src/lib/date-format";

export function DeleteAttendanceButton({
  recordId,
  date,
  className,
}: {
  recordId: string;
  date: Date;
  className?: string;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className={`flex items-center gap-1 ${className ?? ""}`}>
        <form action={deleteAttendanceRecord}>
          <input type="hidden" name="recordId" value={recordId} />
          <Button type="submit" variant="danger" size="sm">
            Borrar {formatDbDate(date)}
          </Button>
        </form>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setConfirming(false)}
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      variant="danger"
      size="sm"
      onClick={() => setConfirming(true)}
      className={className}
    >
      Borrar
    </Button>
  );
}