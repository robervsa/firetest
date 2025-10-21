
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

import type { Entity, Profile } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

const formSchema = z.object({
  description: z.string().min(2, {
    message: 'La descripción debe tener al menos 2 caracteres.',
  }),
  amount: z.coerce.number().positive({
    message: 'El monto debe ser un número positivo.',
  }),
  entity_id: z.string().min(1, { message: 'Por favor, seleccione una entidad.' }),
});

export default function AddIncomeForm() {
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      amount: 0,
      entity_id: '',
    },
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [entities, setEntities] = useState<Entity[]>([]);
  
  useEffect(() => {
    const fetchInitialData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileData) {
            setProfile(profileData);
        }
        
        if (profileData?.role === 'admin') {
          const { data: entitiesData } = await supabase.from('entities').select('*');
          if (entitiesData) {
              const mappedEntities = entitiesData.map(e => ({...e, employeeCount: e.employee_count, totalExpenses: e.total_expenses}));
              setEntities(mappedEntities);
          }
        }
    }
    fetchInitialData();
  }, [supabase, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !profile) {
        toast({ title: 'Error', description: 'Debes iniciar sesión para registrar un ingreso.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
    }
     if (profile.role !== 'admin') {
        toast({ title: 'Acceso denegado', description: 'Solo los administradores pueden registrar ingresos.', variant: 'destructive' });
        setIsSubmitting(false);
        return;
    }
    
    const incomeData = {
        description: values.description,
        amount: values.amount,
        entity_id: values.entity_id,
        user_id: user.id,
    };
    
    const { error } = await supabase.from('incomes').insert([incomeData]);
    
    if (error) {
        toast({
            title: 'Error',
            description: `Hubo un error al registrar el ingreso: ${error.message}`,
            variant: 'destructive',
        });
    } else {
        toast({
          title: 'Ingreso Registrado',
          description: `El ingreso de ${values.amount} ha sido registrado.`,
        });
        form.reset();
        router.push('/');
    }
    setIsSubmitting(false);
  }

  if (profile?.role !== 'admin') {
    return <p>No tiene permisos para ver este formulario.</p>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Pago de cliente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
            name="entity_id"
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
                      <SelectItem key={entity.id} value={entity.id}>
                        {entity.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <FormDescription>
                  El ingreso se asociará a esta entidad.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        
        <div className="flex flex-col-reverse sm:flex-row gap-2">
            <Button 
                type="button" 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/')}
            >
                Cancelar
            </Button>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Registrar Ingreso
            </Button>
        </div>
      </form>
    </Form>
  );
}
