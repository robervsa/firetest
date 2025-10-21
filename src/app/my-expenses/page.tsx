

'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Expense } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export default function MyExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  const fetchExpenses = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    };

    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching expenses:', error);
      toast({ title: 'Error', description: 'No se pudieron cargar los gastos.', variant: 'destructive' });
    } else {
      setExpenses(data as Expense[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchExpenses();

    const channel = supabase.channel('realtime expenses-user')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'expenses'
      }, (payload) => {
        // A simple refetch might be inefficient but is reliable.
        // For optimization, one could check payload and update state directly.
        fetchExpenses();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const handleDelete = async (id: string) => {
      const { error } = await supabase.from('expenses').delete().eq('id', id);

      if (error) {
          toast({ title: 'Error', description: 'No se pudo eliminar el gasto.', variant: 'destructive' });
      } else {
          toast({ title: 'Éxito', description: 'Gasto eliminado correctamente.' });
          // No need to manually filter, realtime subscription will trigger a refetch
      }
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle>Mis Gastos</CardTitle>
            <CardDescription>
              Aquí puedes ver y gestionar todos los gastos que has registrado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Cargando gastos...</p>
            ) : expenses.length === 0 ? (
                <p>Aún no has registrado ningún gasto.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Entidad</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium">{expense.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{expense.category}</Badge>
                      </TableCell>
                       <TableCell>{expense.entity}</TableCell>
                      <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                       <TableCell className="text-right">
                        <Button variant="ghost" size="icon" disabled>
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Esto eliminará permanentemente el gasto
                                de nuestros servidores.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(expense.id)}>Continuar</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
