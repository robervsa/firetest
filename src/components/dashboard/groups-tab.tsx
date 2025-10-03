
'use client';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import AddGroupForm from '@/components/add-group-form';
import type { Group } from '@/lib/types';
import { Users, PlusCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function GroupsTab() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const supabase = createClient();

  const fetchGroups = async () => {
    const { data, error } = await supabase.from('groups').select('*');
    if (data) {
        const mappedData = data.map(e => ({...e, id: e.id, name: e.name, employeeCount: e.employee_count, totalExpenses: e.total_expenses}));
        setGroups(mappedData);
    }
  };

  useEffect(() => {
    fetchGroups();

    const channel = supabase.channel('realtime groups')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'groups'
        }, (payload) => {
            fetchGroups();
        })
        .subscribe();
    
    return () => {
        supabase.removeChannel(channel);
    }
  }, [supabase]);

  const handleGroupAdded = (newGroup: Group) => {
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Listado de Grupos</CardTitle>
          <CardDescription>
            Agregue y gestione los grupos.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Grupo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Grupo</DialogTitle>
            </DialogHeader>
            <AddGroupForm onGroupAdded={handleGroupAdded} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group.id} className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex bg-primary">
              <AvatarFallback className="text-primary-foreground">
                {group.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">{group.name}</p>
              <p className="text-sm text-muted-foreground">
                ${group.totalExpenses.toLocaleString()} en gastos
              </p>
            </div>
            <div className="ml-auto font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              {group.employeeCount}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
