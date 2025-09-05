
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
import AddEntityForm from '@/components/add-entity-form';
import { mockEntities } from '@/lib/data';
import type { Entity } from '@/lib/types';
import { Users, PlusCircle } from 'lucide-react';

export default function EntitiesTab() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const storedEntities = localStorage.getItem('entities');
    if (storedEntities) {
      setEntities(JSON.parse(storedEntities));
    } else {
      setEntities(mockEntities);
      localStorage.setItem('entities', JSON.stringify(mockEntities));
    }
  }, []);

  const handleEntityAdded = (newEntity: Entity) => {
    const updatedEntities = [...entities, newEntity];
    setEntities(updatedEntities);
    localStorage.setItem('entities', JSON.stringify(updatedEntities));
    setIsDialogOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Listado de Entidades</CardTitle>
          <CardDescription>
            Agregue y gestione las entidades de su organización.
          </CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Entidad
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Añadir Nueva Entidad</DialogTitle>
            </DialogHeader>
            <AddEntityForm onEntityAdded={handleEntityAdded} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {entities.map((entity) => (
          <div key={entity.id} className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex bg-primary">
              <AvatarFallback className="text-primary-foreground">
                {entity.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <p className="text-sm font-medium leading-none">{entity.name}</p>
              <p className="text-sm text-muted-foreground">
                ${entity.totalExpenses.toLocaleString()} en gastos
              </p>
            </div>
            <div className="ml-auto font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              {entity.employeeCount}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
