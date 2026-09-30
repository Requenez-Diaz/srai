import { Badge } from "@/app/src/components/ui/badge";
import { formatHours, type DayHoursResult } from "@/app/src/lib/attendance-hours";

export function HoursBadge({ day }: { day: DayHoursResult }) {
  if (day.totalHours === null) {
    return <Badge variant="default">--</Badge>;
  }

  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-1">
      <Badge variant="resolved">{formatHours(day.totalHours)}h</Badge>
      {day.hasOpenShift && <Badge variant="critical">Incompleto</Badge>}
    </span>
  );
}
