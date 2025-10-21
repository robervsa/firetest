
import Header from '@/components/header';
import AddIncomeForm from '@/components/add-income-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AddIncomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-start p-4">
        <Card className="w-full max-w-2xl mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Registrar un Nuevo Ingreso</CardTitle>
            <CardDescription>
              Complete el formulario para agregar un nuevo ingreso a una entidad.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddIncomeForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
