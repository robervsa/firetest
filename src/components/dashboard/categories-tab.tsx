
'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import AddCategoryForm from '@/components/add-category-form';
import type { ExpenseCategory } from '@/lib/types';
import { PlusCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';

export default function CategoriesTab() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
        const { data, error } = await supabase.from('categories').select('*');
        if (data) {
            setCategories(data);
        }
    };
    fetchCategories();

    const channel = supabase.channel('realtime categories')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'categories'
        }, (payload) => {
            fetchCategories();
        })
        .subscribe();
    
    return () => {
        supabase.removeChannel(channel);
    }
  }, []);

  const handleCategoryAdded = (newCategory: ExpenseCategory) => {
    // No need to manually add, realtime subscription will handle it.
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Listado de Categorías</CardTitle>
          <CardDescription>
            Agregue y gestione las categorías de gastos.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Categoría
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Añadir Nueva Categoría</DialogTitle>
            </DialogHeader>
            <AddCategoryForm onCategoryAdded={handleCategoryAdded} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
