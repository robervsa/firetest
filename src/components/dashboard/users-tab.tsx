
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
import type { User, Group } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function UsersTab() {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  const fetchUsersAndGroups = async () => {
    setLoading(true);
    // Fetch all groups first
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select('*');

    if (groupsError) {
      console.error('Error fetching groups:', groupsError);
      toast({ title: 'Error', description: 'No se pudieron cargar los grupos.', variant: 'destructive' });
      setLoading(false);
      return;
    }
    const mappedGroups = groupsData.map(e => ({ ...e, employeeCount: e.employee_count, totalExpenses: e.total_expenses }));
    setGroups(mappedGroups);

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
        .select('id, group_id');
    
    if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
    }
    
    const combinedUsers: User[] = usersData.map(user => {
      const profile = profilesData?.find(p => p.id === user.id);
      const group = mappedGroups.find(e => e.id === profile?.group_id);
      return {
        id: user.id,
        email: user.email,
        role: user.role,
        group_id: profile?.group_id || null,
        group_name: group?.name || 'Sin Asignar',
      };
    });

    setUsers(combinedUsers);
    setLoading(false);
  };
  
  useEffect(() => {
    fetchUsersAndGroups();
  }, [supabase, toast]);

  const handleGroupChange = async (userId: string, groupId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ group_id: groupId === 'none' ? null : groupId })
      .eq('id', userId);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el grupo del usuario.', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Grupo actualizado correctamente.' });
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, group_id: groupId, group_name: groups.find(e => e.id === groupId)?.name || 'Sin Asignar' }
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
          Asigna roles y grupos a los usuarios del sistema.
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
                <TableHead>Grupo Asignado</TableHead>
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
                        defaultValue={user.group_id || 'none'}
                        onValueChange={(value) => handleGroupChange(user.id, value)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Seleccionar grupo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Sin Asignar</SelectItem>
                          {groups.map(group => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
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
