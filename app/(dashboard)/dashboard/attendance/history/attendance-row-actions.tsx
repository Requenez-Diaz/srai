"use client";

import { ManualAttendanceDialog } from "../manual-attendance-dialog";
import type { EditableAttendance } from "../manual-attendance-form";
import { DeleteAttendanceButton } from "./delete-attendance-button";

type Props = {
  record: EditableAttendance;
  users: { id: string; name: string; role: string }[];
  canPickUser: boolean;
  todayKey: string;
};

export function AttendanceRowActions({
  record,
  users,
  canPickUser,
  todayKey,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <ManualAttendanceDialog
        users={users}
        canPickUser={canPickUser}
        todayKey={todayKey}
        record={record}
        triggerLabel="Editar"
        triggerVariant="secondary"
      />
      <DeleteAttendanceButton recordId={record.id} date={record.date} />
    </div>
  );
}