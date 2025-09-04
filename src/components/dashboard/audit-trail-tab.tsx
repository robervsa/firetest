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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { mockAuditLogs } from '@/lib/data';
import type { AuditLogAction } from '@/lib/types';

const getBadgeVariant = (action: AuditLogAction) => {
  switch (action) {
    case 'inicio de sesion':
      return 'default';
    case 'cierre de sesión':
      return 'secondary';
    case 'añadir gasto':
      return 'outline';
    case 'editar gasto':
      return 'destructive';
    default:
      return 'default';
  }
};


export default function AuditTrailTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
        <CardDescription>
          Un registro de todas las acciones realizadas por los usuarios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Detalles</TableHead>
              <TableHead className="text-right">Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAuditLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="hidden h-9 w-9 sm:flex bg-muted">
                        <AvatarFallback>{log.userAvatar}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{log.user}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getBadgeVariant(log.action)}>{log.action}</Badge>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-muted-foreground">{log.details}</p>
                </TableCell>
                <TableCell className="text-right">
                  <p className="text-sm">{new Date(log.date).toLocaleDateString()}</p>
                  <p className="text-xs text-muted-foreground">{new Date(log.date).toLocaleTimeString()}</p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
