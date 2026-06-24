import { Card, CardHeader, CardTitle } from "@/app/src/components/ui/card";
import { Input } from "@/app/src/components/ui/input";
import { Button } from "@/app/src/components/ui/button";

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Iniciar Sesión</CardTitle>
        <p className="mt-1 text-center text-sm text-zinc-500">
          Ingresa tus credenciales para acceder al sistema
        </p>
      </CardHeader>
      <form className="space-y-4">
        <Input label="Correo electrónico" type="email" placeholder="correo@ejemplo.com" />
        <Input label="Contraseña" type="password" placeholder="••••••••" />
        <Button type="submit" className="w-full">
          Ingresar
        </Button>
      </form>
    </Card>
  );
}
