
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

const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 50%)`;
};

export default function CategoriesTab() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchAndProcessCategories = async () => {
        const { data, error } = await supabase.from('categories').select('*');
        if (data) {
            setCategories(data);
            
            const categoriesToUpdate = data.filter(cat => !cat.color);
            if (categoriesToUpdate.length > 0) {
                const updates = categoriesToUpdate.map(cat => ({
                    ...cat,
                    color: generateRandomColor()
                }));
                
                // We don't need to await this, it can run in the background
                supabase.from('categories').upsert(updates).then(({error}) => {
                    if (error) {
                        console.error('Error updating categories with colors:', error);
                    } else {
                        // Optionally re-fetch to show new colors, 
                        // but the realtime subscription should handle this.
                    }
                });
            }
        }
    };
    
    fetchAndProcessCategories();

    const channel = supabase.channel('realtime categories')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'categories'
        }, (payload) => {
            // Re-fetch all data on any change
            fetchAndProcessCategories();
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
              <TableHead>Color</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: category.color || '#ccc' }}
                    />
                    <span>{category.color}</span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
