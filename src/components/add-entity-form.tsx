
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
}

export default function AddEntityForm({ onEntityAdded }: AddEntityFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      employeeCount: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const newEntity: Entity = {
      id: new Date().toISOString(),
      ...values,
      totalExpenses: 0, // Initial value for new entities
    };
    onEntityAdded(newEntity);
    toast({
      title: 'Entidad Añadida',
      description: `La entidad "${values.name}" ha sido agregada.`,
    });
    form.reset();
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
