
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { Entity } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'El nombre debe tener al menos 2 caracteres.',
  }),
  employeeCount: z.coerce.number().int().positive({
    message: 'El número de empleados debe ser un entero positivo.',
  }),
});

interface AddEntityFormProps {
  onEntityAdded: (entity: Entity) => void;
  parentId?: string | null;
}

export default function AddEntityForm({ onEntityAdded, parentId = null }: AddEntityFormProps) {
  const { toast } = useToast();
  const supabase = createClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      employeeCount: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast({ title: 'Error', description: 'Debes iniciar sesión para agregar una entidad.', variant: 'destructive' });
        return;
    }
    
    const { data, error } = await supabase
      .from('entities')
      .insert([
        { 
            name: values.name, 
            employee_count: values.employeeCount, 
            total_expenses: 0, 
            user_id: user.id,
            parent_id: parentId
        },
      ])
      .select()
      .single();
    
    if (error) {
        toast({
            title: 'Error',
            description: `Hubo un error al agregar la entidad: ${error.message}`,
            variant: 'destructive'
        })
    } else {
        const newEntity: Entity = {
            id: data.id,
            name: data.name,
            employeeCount: data.employee_count,
            totalExpenses: data.total_expenses,
            user_id: data.user_id,
            parent_id: data.parent_id,
        }
        onEntityAdded(newEntity);
        toast({
          title: 'Entidad Añadida',
          description: `La entidad "${values.name}" ha sido agregada.`,
        });
        form.reset();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la Entidad</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Departamento de IT" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="employeeCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Número de Empleados</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Añadir Entidad</Button>
      </form>
    </Form>
  );
}
