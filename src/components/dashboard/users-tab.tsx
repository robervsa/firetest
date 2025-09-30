
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import type { User, Entity } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  const fetchUsersAndEntities = async () => {
    setLoading(true);
    // Fetch all entities first
    const { data: entitiesData, error: entitiesError } = await supabase
      .from('entities')
      .select('*');

    if (entitiesError) {
      console.error('Error fetching entities:', entitiesError);
      toast({ title: 'Error', description: 'No se pudieron cargar las entidades.', variant: 'destructive' });
      setLoading(false);
      return;
    }
    const mappedEntities = entitiesData.map(e => ({ ...e, employeeCount: e.employee_count, totalExpenses: e.total_expenses }));
    setEntities(mappedEntities);

    // Fetch users and their profiles
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('id, email, role');
      
    if (usersError) {
        console.error('Error fetching users:', usersError);
        toast({ title: 'Error', description: 'No se pudieron cargar los usuarios.', variant: 'destructive' });
        setLoading(false);
        return;
    }

    const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, entity_id');
    
    if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
    }
    
    const combinedUsers: User[] = usersData.map(user => {
      const profile = profilesData?.find(p => p.id === user.id);
      const entity = mappedEntities.find(e => e.id === profile?.entity_id);
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        entity_id: profile?.entity_id || null,
        entity_name: entity?.name || 'Sin Asignar',
      };
    });

    setUsers(combinedUsers);
    setLoading(false);
  };
  
  useEffect(() => {
    fetchUsersAndEntities();
  }, [supabase, toast]);

  const handleEntityChange = async (userId: string, entityId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ entity_id: entityId === 'none' ? null : entityId })
      .eq('id', userId);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar la entidad del usuario.', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Entidad actualizada correctamente.' });
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, entity_id: entityId, entity_name: entities.find(e => e.id === entityId)?.name || 'Sin Asignar' }
          : u
      ));
    }
  };

  const getInitials = (email?: string) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestión de Usuarios</CardTitle>
        <CardDescription>
          Asigna roles y entidades a los usuarios del sistema.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Cargando usuarios...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Entidad Asignada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="hidden h-9 w-9 sm:flex bg-muted">
                        <AvatarFallback>{getInitials(user.email)}</AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.role === 'employee' ? (
                      <Select
                        defaultValue={user.entity_id || 'none'}
                        onValueChange={(value) => handleEntityChange(user.id, value)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Seleccionar entidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin Asignar</SelectItem>
                          {entities.map(entity => (
                            <SelectItem key={entity.id} value={entity.id}>
                              {entity.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
