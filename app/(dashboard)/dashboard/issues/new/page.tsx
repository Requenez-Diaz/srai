import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { Input } from "@/app/src/components/ui/input";
import { Textarea } from "@/app/src/components/ui/textarea";
import { Select } from "@/app/src/components/ui/select";
import { Button } from "@/app/src/components/ui/button";

export default function NewIssuePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Reportar Incidencia</h2>
        <p className="text-sm text-zinc-500">Describe el problema para que podamos ayudarte</p>
      </div>

      <Card>
        <form className="space-y-4">
          <Input label="Título" placeholder="Ej: Proyector dañado en Aula 101" />

          <Textarea
            label="Descripción"
            placeholder="Describe el problema con el mayor detalle posible..."
            rows={4}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Ubicación - Edificio">
              <option>Seleccionar edificio</option>
              <option>Edificio A</option>
              <option>Edificio B</option>
              <option>Edificio Central</option>
              <option>Biblioteca</option>
              <option>Laboratorio</option>
            </Select>
            <Input label="Aula / Sala" placeholder="Ej: 101" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Prioridad">
              <option value="LOW">Baja</option>
              <option value="MEDIUM">Media</option>
              <option value="HIGH">Alta</option>
              <option value="CRITICAL">Crítica</option>
            </Select>
            <Input label="Piso" type="number" placeholder="1" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Foto (opcional)
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full text-sm text-zinc-500 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200 dark:text-zinc-400 dark:file:bg-zinc-800 dark:file:text-zinc-300"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit">Enviar Reporte</Button>
            <Button type="reset" variant="secondary">Cancelar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
