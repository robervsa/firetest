
'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BalanceTab from '@/components/dashboard/balance-tab';
import EntitiesTab from '@/components/dashboard/entities-tab';
import CategoriesTab from '@/components/dashboard/categories-tab';
import UsersTab from '@/components/dashboard/users-tab';
import Header from '@/components/header';
import { useState, useEffect } from 'react';
import type { Expense } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';


export default function DashboardPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const fetchExpenses = async () => {
        const { data, error } = await supabase
            .from('expenses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching expenses:', error.message);
        } else {
            setExpenses(data as Expense[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchExpenses();
        
        const channel = supabase.channel('realtime expenses')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'expenses'
            }, (payload) => {
                fetchExpenses();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [supabase]);

    const totalSpent = expenses.reduce((acc, expense) => acc + expense.amount, 0);


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gastos este mes
              </CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{expenses.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ediciones hechas
              </CardTitle>
              <svg
                xmlns="http://www.w a.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="5" rx="2" />
                <path d="M2 10h20" />
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12</div>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="balance">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="balance">Balance</TabsTrigger>
            <TabsTrigger value="entities">Grupos</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
          </TabsList>
          <TabsContent value="balance">
            <BalanceTab expenses={expenses} />
          </TabsContent>
          <TabsContent value="entities">
            <EntitiesTab />
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>
           <TabsContent value="users">
            <UsersTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
