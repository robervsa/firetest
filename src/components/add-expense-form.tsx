'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

import { suggestExpenseCategory } from '@/ai/flows/suggest-expense-category';
import type { ExpenseCategory } from '@/lib/types';
import { mockEntities } from '@/lib/data';

const categories: ExpenseCategory[] = ['comida', 'combustible', 'limpieza', 'transporte', 'oficina', 'otro'];

const formSchema = z.object({
  description: z.string().min(2, {
    message: 'La descripción debe tener al menos 2 caracteres.',
  }),
  amount: z.coerce.number().positive({
    message: 'El monto debe ser un número positivo.',
  }),
  category: z.enum(categories, {
    errorMap: () => ({ message: 'Por favor, seleccione una categoría válida.' }),
  }),
  entity: z.string().min(1, { message: 'Por favor, seleccione una entidad.' }),
});

export default function AddExpenseForm() {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
    },
  });

  async function handleGetSuggestions() {
    const description = form.getValues('description');
    const amount = form.getValues('amount');
    if (!description || description.length < 5 || !amount) {
      setSuggestions([]);
      return;
    }
    
    setIsLoadingSuggestions(true);
    try {
      const result = await suggestExpenseCategory({ description, amount });
      const validSuggestions = result.categorySuggestions.filter(cat => categories.includes(cat as ExpenseCategory));
      setSuggestions(validSuggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    toast({
      title: 'Gasto Registrado',
      description: `El gasto de ${values.amount} en ${values.category} ha sido registrado.`,
    });
    form.reset();
    setSuggestions([]);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monto</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Almuerzo con cliente" {...field} onBlur={handleGetSuggestions} />
              </FormControl>
              <FormDescription>
                Sea descriptivo para obtener mejores sugerencias de categoría.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isLoadingSuggestions && (
                <div className='flex items-center text-sm text-muted-foreground mt-2'>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando sugerencias...
                </div>
              )}
              {suggestions.length > 0 && !isLoadingSuggestions && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-sm text-muted-foreground mr-2">Sugerencias:</span>
                  {suggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        form.setValue('category', suggestion as ExpenseCategory);
                      }}
                    >
                      {suggestion.charAt(0).toUpperCase() + suggestion.slice(1)}
                    </Button>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="entity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Entidad</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una entidad" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {mockEntities.map((entity) => (
                    <SelectItem key={entity.id} value={entity.name}>
                      {entity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Registrar Gasto</Button>
      </form>
    </Form>
  );
}
