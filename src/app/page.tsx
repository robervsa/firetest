
'use client';

import Header from '@/components/header';
import IncomeExpenseDashboard from '@/components/dashboard/income-expense-dashboard';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import type { Profile } from '@/lib/types';
import MyExpensesPage from './my-expenses/page';

export default function DashboardPage() {
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchUserRole = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile, error } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                
                if (profile) {
                    setRole(profile.role);
                } else if(error) {
                    console.error("Error fetching profile:", error.message);
                }
            }
            setLoading(false);
        };
        fetchUserRole();
    }, [supabase]);

    if (loading) {
        return (
             <div className="flex min-h-screen w-full flex-col">
                <Header />
                <main className="flex flex-1 items-center justify-center">
                    <p>Cargando...</p>
                </main>
            </div>
        )
    }
    
    // Si es empleado, redirige o muestra la página de "Mis Gastos".
    // El middleware ya debería manejar esto, pero es una salvaguarda.
    if (role === 'employee') {
        return <MyExpensesPage />;
    }

    return (
        <div className="flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                {role === 'admin' ? (
                  <IncomeExpenseDashboard />
                ) : (
                  <div className="flex flex-1 items-center justify-center">
                    <p>Acceso no autorizado.</p>
                  </div>
                )}
            </main>
        </div>
    );
}
