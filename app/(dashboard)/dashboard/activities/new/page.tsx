import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { Input } from "@/app/src/components/ui/input";
import { Textarea } from "@/app/src/components/ui/textarea";
import { Select } from "@/app/src/components/ui/select";
import { Button } from "@/app/src/components/ui/button";

export default function NewActivityPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Registrar Actividad</h2>
        <p className="text-sm text-zinc-500">Crea una nueva actividad académica o evento</p>
      </div>

      <Card>
        <form className="space-y-4">
          <Input label="Título de la actividad" placeholder="Ej: Taller de Robótica" />

          <Textarea
            label="Descripción"
            placeholder="Describe la actividad, objetivos y detalles relevantes..."
            rows={4}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Fecha de inicio" type="date" />
            <Input label="Hora de inicio" type="time" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Fecha de fin" type="date" />
            <Input label="Hora de fin" type="time" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Edificio">
              <option>Seleccionar edificio</option>
              <option>Edificio A</option>
              <option>Edificio B</option>
              <option>Edificio Central</option>
              <option>Biblioteca</option>
              <option>Laboratorio</option>
              <option>Auditorio</option>
            </Select>
            <Input label="Aula / Sala" placeholder="Ej: 101" />
          </div>

          <Input label="Piso" type="number" placeholder="1" />

          <div className="flex gap-3 pt-2">
            <Button type="submit">Crear Actividad</Button>
            <Button type="reset" variant="secondary">Cancelar</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
