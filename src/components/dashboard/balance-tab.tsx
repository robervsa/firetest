'use client';
import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { mockExpenses } from '@/lib/data';

const initialChartData = [
    { name: 'Comida', total: 0 },
    { name: 'Combustible', total: 0 },
    { name: 'Limpieza', total: 0 },
    { name: 'Transporte', total: 0 },
    { name: 'Oficina', total: 0 },
    { name: 'Otro', total: 0 },
  ];

export default function BalanceTab() {
  const [chartData, setChartData] = useState(initialChartData);

  useEffect(() => {
    setChartData([
      { name: 'Comida', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Combustible', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Limpieza', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Transporte', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Oficina', total: Math.floor(Math.random() * 5000) + 1000 },
      { name: 'Otro', total: Math.floor(Math.random() * 5000) + 1000 },
    ]);
  }, []);

  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Gastos por Categoría</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Gastos Recientes</CardTitle>
          <CardDescription>
            Últimos 5 gastos registrados en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockExpenses.slice(0, 5).map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div className="font-medium">{expense.user}</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      {expense.entity}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{expense.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">${expense.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
