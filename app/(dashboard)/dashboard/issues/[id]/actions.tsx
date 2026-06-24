"use client";

import { useActionState } from "react";
import { Button } from "@/app/src/components/ui/button";
import { Textarea } from "@/app/src/components/ui/textarea";
import { Select } from "@/app/src/components/ui/select";
import { updateIssueStatus, assignIssue } from "@/app/src/lib/actions/issues";

export function IssueActions({
  issueId,
  currentStatus,
  supportUsers,
}: {
  issueId: string;
  currentStatus: string;
  supportUsers: { id: string; name: string; email: string; role: string }[];
}) {
  const [statusState, statusAction, statusPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      formData.set("issueId", issueId);
      const result = await updateIssueStatus(formData);
      return result;
    },
    undefined,
  );

  const [assignState, assignAction, assignPending] = useActionState(
    async (_prev: unknown, formData: FormData) => {
      formData.set("issueId", issueId);
      const result = await assignIssue(formData);
      return result;
    },
    undefined,
  );

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Cambiar Estado
        </h4>
        <form action={statusAction} className="flex items-end gap-3">
          <div className="flex-1">
            <Select name="status" defaultValue={currentStatus}>
              <option value="OPEN">Abierto</option>
              <option value="IN_PROGRESS">En Progreso</option>
              <option value="RESOLVED">Resuelto</option>
              <option value="REJECTED">Rechazado</option>
            </Select>
          </div>
          <Button type="submit" size="sm" disabled={statusPending}>
            {statusPending ? "..." : "Actualizar"}
          </Button>
        </form>
        {statusState?.error && (
          <p className="mt-1 text-xs text-red-500">{statusState.error}</p>
        )}
      </div>

      <div>
        <h4 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Agregar Comentario
        </h4>
        <form action={statusAction} className="space-y-2">
          <Textarea
            name="comment"
            placeholder="Escribe un comentario sobre el cambio de estado..."
            rows={2}
          />
          <input type="hidden" name="status" value={currentStatus} />
          <Button type="submit" size="sm" variant="secondary" disabled={statusPending}>
            Agregar Comentario
          </Button>
        </form>
      </div>

      {supportUsers.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Asignar a Soporte
          </h4>
          <form action={assignAction} className="flex items-end gap-3">
            <div className="flex-1">
              <Select name="assignedToId">
                <option value="">Seleccionar usuario</option>
                {supportUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" size="sm" disabled={assignPending}>
              {assignPending ? "..." : "Asignar"}
            </Button>
          </form>
          {assignState?.error && (
            <p className="mt-1 text-xs text-red-500">{assignState.error}</p>
          )}
        </div>
      )}
    </div>
  );
}
