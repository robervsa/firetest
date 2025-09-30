import Header from '@/components/header';
import AddExpenseForm from '@/components/add-expense-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function AddExpensePage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col items-center justify-start p-4">
        <Card className="w-full max-w-2xl mt-8">
          <CardHeader>
            <CardTitle className="text-2xl">Registrar un Nuevo Gasto</CardTitle>
            <CardDescription>
              Complete el formulario para agregar un nuevo gasto. Use la descripción para obtener sugerencias de categorías.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddExpenseForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
