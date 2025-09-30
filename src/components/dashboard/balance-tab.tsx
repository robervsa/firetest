
'use client';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
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
import { createClient } from '@/lib/supabase/client';

export default function BalanceTab({ expenses }: { expenses: Expense[] }) {
  const [chartData, setChartData] = useState<{name: string, value: number, fill: string}[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const supabase = createClient();
  
  useEffect(() => {
    const fetchCategories = async () => {
        const { data, error } = await supabase.from('categories').select('*');
        if (data) {
            setCategories(data);
        }
    }
    fetchCategories();
  }, [supabase]);

  useEffect(() => {
    if (expenses.length > 0 && categories.length > 0) {
      
      const categoryTotals = categories.map(category => {
        const total = expenses
          .filter(expense => expense.category === category.name)
          .reduce((acc, expense) => acc + expense.amount, 0);
        
        return {
          name: category.name.charAt(0).toUpperCase() + category.name.slice(1),
          value: total,
          fill: category.color || '#cccccc' // Use saved color or a default
        };
      }).filter(c => c.value > 0); // Only show categories with expenses

      setChartData(categoryTotals);
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
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
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
                <TableHead>Descripción</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.slice(0, 5).map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    <div className="font-medium">{expense.description}</div>
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

    