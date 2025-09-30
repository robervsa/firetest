
'use client';
import { useEffect, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell } from 'recharts';
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
import type { Expense, ExpenseCategory } from '@/lib/types';
import { supabase } from '@/lib/supabase/client';

const generateRandomColor = () => {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 50%)`;
};

export default function BalanceTab({ expenses }: { expenses: Expense[] }) {
  const [chartData, setChartData] = useState<{name: string, total: number, fill: string}[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  
  useEffect(() => {
    const fetchCategories = async () => {
        const { data, error } = await supabase.from('categories').select('*');
        if (data) {
            setCategories(data);
        }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (expenses.length > 0 && categories.length > 0) {
      const categoryColors: {[key: string]: string} = {};
      categories.forEach(c => {
        categoryColors[c.name] = generateRandomColor();
      });

      const initialChartData = categories.map(c => ({ 
          name: c.name.charAt(0).toUpperCase() + c.name.slice(1), 
          total: 0,
          fill: categoryColors[c.name]
      }));

      const data = expenses.reduce((acc, expense) => {
          const categoryName = expense.category.charAt(0).toUpperCase() + expense.category.slice(1);
          const category = acc.find(c => c.name === categoryName);
          if (category) {
              category.total += expense.amount;
          }
          return acc;
      }, JSON.parse(JSON.stringify(initialChartData)));
      setChartData(data);
    }
  }, [expenses, categories]);

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
              <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
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
              {expenses.slice(0, 5).map((expense) => (
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
