
'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
import type { ExpenseCategory, Entity, UserRole, Profile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

const formSchema = z.object({
  description: z.string().min(2, {
    message: 'La descripción debe tener al menos 2 caracteres.',
  }),
  amount: z.coerce.number().positive({
    message: 'El monto debe ser un número positivo.',
  }),
  category: z.string().min(1, { message: 'Por favor, seleccione una categoría.' }),
  entity: z.string().optional(),
});

export default function AddExpenseForm() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userEntity, setUserEntity] = useState<Entity | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
      category: '',
      entity: '',
    },
  });

  useEffect(() => {
    const fetchInitialData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profile) {
            const role = profile.role as UserRole
            setUserRole(role);
            if (profile.entity_id) {
                const { data: entityData } = await supabase
                    .from('entities')
                    .select('*')
                    .eq('id', profile.entity_id)
                    .single();
                if (entityData) {
                    const mappedEntity = {...entityData, employeeCount: entityData.employee_count, totalExpenses: entityData.total_expenses};
                    setUserEntity(mappedEntity);
                    if (role === 'employee') {
                        form.setValue('entity', mappedEntity.name);
                    }
                }
            }
        }
        
        const { data: categoriesData } = await supabase.from('categories').select('*');
        if (categoriesData) setCategories(categoriesData);

        const { data: entitiesData } = await supabase.from('entities').select('*');
        if (entitiesData) {
            const mappedEntities = entitiesData.map(e => ({...e, employeeCount: e.employee_count, totalExpenses: e.total_expenses}));
            setEntities(mappedEntities);
        }
    }
    fetchInitialData();
  }, [supabase, form]);

  async function handleGetSuggestions() {
    const description = form.getValues('description');
    const amount = form.getValues('amount');
    if (!description || description.length < 5 || !amount) {
      setSuggestions([]);
      return;
    }
    
    setIsLoadingSuggestions(true);
    try {
      const result = await suggestExpenseCategory({ description, amount: Number(amount) });
      const validSuggestions = result.categorySuggestions.filter(cat => categories.some(c => c.name === cat));
      setSuggestions(validSuggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      setSuggestions([]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast({ title: 'Error', description: 'Debes iniciar sesión para registrar un gasto.', variant: 'destructive' });
        return;
    }
    
    const expenseData: {
      description: string;
      amount: number;
      category: string;
      entity: string;
      user_id: string;
    } = {
        description: values.description,
        amount: values.amount,
        category: values.category,
        entity: '',
        user_id: user.id,
    };

    if (userRole === 'employee' && userEntity) {
        expenseData.entity = userEntity.name;
    } else if (values.entity) {
        expenseData.entity = values.entity;
    } else {
        toast({ title: 'Error', description: 'No se pudo determinar la entidad. Por favor, seleccione una.', variant: 'destructive' });
        return;
    }
    
    const { error } = await supabase.from('expenses').insert([expenseData]);
    
    if (error) {
        toast({
            title: 'Error',
            description: `Hubo un error al registrar el gasto: ${error.message}`,
            variant: 'destructive',
        });
    } else {
        toast({
          title: 'Gasto Registrado',
          description: `El gasto de ${values.amount} en ${values.category} ha sido registrado.`,
        });
        form.reset();
        setSuggestions([]);
        if (userEntity && userRole === 'employee') form.setValue('entity', userEntity.name);
        router.push('/my-expenses');
    }
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
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}
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
                        form.setValue('category', suggestion as ExpenseCategory['name']);
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

        {userRole === 'admin' && (
          <FormField
            control={form.control}
            name="entity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Entidad</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una entidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {entities.map((entity) => (
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
        )}
        
        <Button type="submit" className="w-full">Registrar Gasto</Button>
      </form>
    </Form>
  );
}
