
'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import type { Entity } from '@/lib/types';
import { DollarSign, ShoppingCart, Scale, Building } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChartData {
    name: string;
    ingresos: number;
    egresos: number;
}

export default function IncomeExpenseDashboard() {
    const [entities, setEntities] = useState<Entity[]>([]);
    const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [totals, setTotals] = useState<{incomes: number, expenses: number, balance: number}>({incomes: 0, expenses: 0, balance: 0});
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchEntities = async () => {
            const { data, error } = await supabase.from('entities').select('*');
            if (data) {
                const mappedData = data.map(e => ({ ...e, id: e.id, name: e.name, employeeCount: e.employee_count, totalExpenses: e.total_expenses }));
                setEntities(mappedData);
                if (mappedData.length > 0) {
                    setSelectedEntity(mappedData[0].id);
                } else {
                    setLoading(false);
                }
            } else if (error) {
                console.error("Error fetching entities:", error.message);
                setLoading(false);
            }
        };
        fetchEntities();
    }, [supabase]);

    useEffect(() => {
        if (!selectedEntity) {
            setChartData([]);
            setTotals({incomes: 0, expenses: 0, balance: 0});
            return
        };

        const fetchDataForEntity = async () => {
            setLoading(true);

            // Fetch Incomes
            const { data: incomesData, error: incomesError } = await supabase
                .from('incomes')
                .select('amount')
                .eq('entity_id', selectedEntity);
            
            // Fetch Expenses
            const selectedEntityObject = entities.find(e => e.id === selectedEntity);
            const { data: expensesData, error: expensesError } = await supabase
                .from('expenses')
                .select('amount')
                .eq('entity', selectedEntityObject?.name || '');

            if (incomesError || expensesError) {
                console.error("Error fetching data:", incomesError?.message || expensesError?.message);
                setLoading(false);
                return;
            }

            const totalIncomes = incomesData?.reduce((acc, income) => acc + income.amount, 0) || 0;
            const totalExpenses = expensesData?.reduce((acc, expense) => acc + expense.amount, 0) || 0;
            const balance = totalIncomes - totalExpenses;
            
            setTotals({incomes: totalIncomes, expenses: totalExpenses, balance: balance});

            setChartData([{
                name: selectedEntityObject?.name || 'Entidad',
                ingresos: totalIncomes,
                egresos: totalExpenses
            }]);
            
            setLoading(false);
        };

        fetchDataForEntity();
    }, [selectedEntity, supabase, entities]);

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Análisis Financiero por Entidad</CardTitle>
                    <CardDescription>Seleccione una entidad para ver su balance de ingresos y egresos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                         {entities.map(entity => (
                            <Card 
                                key={entity.id} 
                                className={cn(
                                    "cursor-pointer hover:border-primary transition-all",
                                    selectedEntity === entity.id && "border-2 border-primary shadow-lg"
                                )}
                                onClick={() => setSelectedEntity(entity.id)}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-4 gap-2 text-center">
                                    <Building className="h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm font-semibold">{entity.name}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {loading ? (
                        <p>Cargando datos de la entidad...</p>
                    ) : selectedEntity ? (
                        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-green-600">${totals.incomes.toFixed(2)}</div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Egresos Totales</CardTitle>
                                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-red-600">${totals.expenses.toFixed(2)}</div>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Balance</CardTitle>
                                    <Scale className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className={`text-2xl font-bold ${totals.balance >= 0 ? 'text-blue-600' : 'text-gray-500'}`}>${totals.balance.toFixed(2)}</div>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-8">
                            <p>No hay entidades creadas. Empiece por agregar una.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Gráfico de Ingresos vs. Egresos</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="w-full h-[300px] flex items-center justify-center">
                            <p>Cargando gráfico...</p>
                         </div>
                    ) : chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                                <Legend />
                                <Bar dataKey="ingresos" fill="#16a34a" name="Ingresos" />
                                <Bar dataKey="egresos" fill="#dc2626" name="Egresos (Gastos)" />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                         <div className="w-full h-[300px] flex items-center justify-center">
                            <p>No hay datos para mostrar. Seleccione una entidad.</p>
                         </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
