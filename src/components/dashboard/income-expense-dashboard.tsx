
'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';
import type { Entity } from '@/lib/types';
import { DollarSign, ShoppingCart, Scale, Building, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import AddEntityForm from '../add-entity-form';

interface ChartData {
    name: string;
    ingresos: number;
    egresos: number;
}

export default function IncomeExpenseDashboard() {
    const [allEntities, setAllEntities] = useState<Entity[]>([]);
    const [topLevelEntities, setTopLevelEntities] = useState<Entity[]>([]);
    const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [totals, setTotals] = useState<{incomes: number, expenses: number, balance: number}>({incomes: 0, expenses: 0, balance: 0});
    const [loading, setLoading] = useState(true);
    const [isAddChildDialogOpen, setAddChildDialogOpen] = useState(false);
    const supabase = createClient();

    const fetchEntities = async () => {
        const { data, error } = await supabase.from('entities').select('*').order('name');
        if (data) {
            const mappedData: Entity[] = data.map(e => ({ ...e, id: e.id, name: e.name, employeeCount: e.employee_count, totalExpenses: e.total_expenses, parent_id: e.parent_id, children: [] }));
            
            const entityMap = new Map(mappedData.map(e => [e.id, e]));
            const rootEntities: Entity[] = [];

            mappedData.forEach(entity => {
                if (entity.parent_id) {
                    const parent = entityMap.get(entity.parent_id);
                    if (parent) {
                        parent.children = parent.children || [];
                        parent.children.push(entity);
                    }
                } else {
                    rootEntities.push(entity);
                }
            });

            setAllEntities(mappedData);
            setTopLevelEntities(rootEntities);
            
            if (rootEntities.length > 0 && !selectedEntity) {
                setSelectedEntity(rootEntities[0]);
            } else if (rootEntities.length === 0) {
                 setLoading(false);
            }

        } else if (error) {
            console.error("Error fetching entities:", error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntities();
         const channel = supabase.channel('realtime entities')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'entities' }, (payload) => {
                fetchEntities();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [supabase]);

    useEffect(() => {
        if (!selectedEntity) {
            setChartData([]);
            setTotals({incomes: 0, expenses: 0, balance: 0});
            setLoading(false);
            return
        };

        const fetchDataForEntity = async () => {
            setLoading(true);

            // Fetch Incomes
            const { data: incomesData, error: incomesError } = await supabase
                .from('incomes')
                .select('amount')
                .eq('entity_id', selectedEntity.id);
            
            // Fetch Expenses
            const { data: expensesData, error: expensesError } = await supabase
                .from('expenses')
                .select('amount')
                .eq('entity', selectedEntity.name);

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
                name: selectedEntity.name,
                ingresos: totalIncomes,
                egresos: totalExpenses
            }]);
            
            setLoading(false);
        };

        fetchDataForEntity();
    }, [selectedEntity, supabase, allEntities]);

    const handleEntityAdded = (newEntity: Entity) => {
        fetchEntities(); // Refresca todas las entidades
        setAddChildDialogOpen(false);
    }

    return (
        <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Análisis Financiero por Entidad</CardTitle>
                    <CardDescription>Seleccione una entidad para ver su balance. Las entidades principales se muestran primero.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                         {topLevelEntities.map(entity => (
                            <Card 
                                key={entity.id} 
                                className={cn(
                                    "cursor-pointer hover:border-primary transition-all",
                                    selectedEntity?.id === entity.id && "border-2 border-primary shadow-lg"
                                )}
                                onClick={() => setSelectedEntity(entity)}
                            >
                                <CardContent className="flex flex-col items-center justify-center p-4 gap-2 text-center">
                                    <Building className="h-8 w-8 text-muted-foreground" />
                                    <p className="text-sm font-semibold">{entity.name}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                     
                    {selectedEntity && (
                        <div className="mt-6 space-y-4 p-4 border-t">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Sub-Entidades de "{selectedEntity.name}"</h3>
                                <Dialog open={isAddChildDialogOpen} onOpenChange={setAddChildDialogOpen}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <PlusCircle className="mr-2 h-4 w-4"/>
                                        Añadir Sub-Entidad
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Añadir Sub-Entidad a "{selectedEntity.name}"</DialogTitle>
                                    </DialogHeader>
                                    <AddEntityForm onEntityAdded={handleEntityAdded} parentId={selectedEntity.id} />
                                  </DialogContent>
                                </Dialog>
                            </div>
                           
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {selectedEntity.children && selectedEntity.children.map(child => (
                                    <Card 
                                        key={child.id}
                                        className="bg-muted/40 cursor-pointer hover:border-primary/50 transition-all"
                                        onClick={() => setSelectedEntity(child)}
                                    >
                                        <CardContent className="flex flex-col items-center justify-center p-4 gap-2 text-center">
                                            <Building className="h-6 w-6 text-muted-foreground/70" />
                                            <p className="text-xs font-medium">{child.name}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                                {(!selectedEntity.children || selectedEntity.children.length === 0) && (
                                    <p className="text-sm text-muted-foreground col-span-full">Esta entidad no tiene sub-entidades.</p>
                                )}
                            </div>
                        </div>
                    )}


                    {loading ? (
                        <p className="text-center py-8">Cargando datos de la entidad...</p>
                    ) : selectedEntity ? (
                        <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
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
                    ) : chartData.length > 0 && selectedEntity ? (
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
