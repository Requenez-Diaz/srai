import { Badge } from "@/app/src/components/ui/badge";
import { formatHours, type DayHoursResult } from "@/app/src/lib/attendance-hours";

export function HoursBadge({ day }: { day: DayHoursResult }) {
  return (
    <span className="inline-flex flex-wrap items-center justify-end gap-1">
      <Badge variant={day.totalHours === null ? "default" : "resolved"}>
        {day.totalHours === null ? "--" : `${formatHours(day.totalHours)}h`}
      </Badge>
      {day.missingCount > 0 && <Badge variant="critical">Incompleto</Badge>}
    </span>
  );
}
