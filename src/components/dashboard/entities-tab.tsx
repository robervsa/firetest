import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockEntities } from '@/lib/data';
import { Users } from 'lucide-react';

export default function EntitiesTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Listado de Entidades</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {mockEntities.map((entity) => (
          <div key={entity.id} className="flex items-center gap-4">
            <Avatar className="hidden h-9 w-9 sm:flex bg-primary">
              <AvatarFallback className="text-primary-foreground">{entity.avatar}</AvatarFallback>
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
