
import type { Expense, Entity, AuditLog, ExpenseCategory } from './types';

export const mockCategories: ExpenseCategory[] = [
  { id: '1', name: 'comida', description: 'Gastos relacionados con alimentación.' },
  { id: '2', name: 'combustible', description: 'Gastos de gasolina y diésel.' },
  { id: '3', name: 'limpieza', description: 'Productos y servicios de limpieza.' },
  { id: '4', name: 'transporte', description: 'Taxis, boletos de autobús, etc.' },
  { id: '5', name: 'oficina', description: 'Suministros y papelería de oficina.' },
  { id: '6', name: 'otro', description: 'Gastos varios no clasificados.' },
];

export const mockExpenses: Expense[] = [
  { id: '1', description: 'Almuerzo de equipo', amount: 150.75, category: 'comida', date: '2024-05-20', entity: 'Unidad de Marketing', user: 'Juan Pérez' },
  { id: '2', description: 'Gasolina para vehículo de la empresa', amount: 65.00, category: 'combustible', date: '2024-05-20', entity: 'Unidad de Ventas', user: 'Maria Rodriguez' },
  { id: '3', description: 'Suministros de limpieza para oficina', amount: 80.20, category: 'limpieza', date: '2024-05-19', entity: 'Oficina Central', user: 'Carlos Gomez' },
  { id: '4', description: 'Viaje en taxi para reunión con cliente', amount: 25.50, category: 'transporte', date: '2024-05-18', entity: 'Unidad de Ventas', user: 'Ana Torres' },
  { id: '5', description: 'Papelería y toners', amount: 120.00, category: 'oficina', date: '2024-05-17', entity: 'Oficina Central', user: 'Luis Fernandez' },
  { id: '6', description: 'Café y snacks para la oficina', amount: 45.30, category: 'comida', date: '2024-05-21', entity: 'Oficina Central', user: 'Juan Pérez' },
  { id: '7', description: 'Llenado de tanque flota #3', amount: 70.00, category: 'combustible', date: '2024-05-21', entity: 'Logística', user: 'Maria Rodriguez' },
];

export const mockEntities: Entity[] = [
  { id: '1', name: 'Casa Tulum', totalExpenses: 3450.50, employeeCount: 12 },
  { id: '2', name: 'Herbamedica', totalExpenses: 8970.00, employeeCount: 25 },
  { id: '3', name: 'Eventos Valle', totalExpenses: 12500.20, employeeCount: 40 },
  { id: '4', name: "Sian Ka'an", totalExpenses: 6200.80, employeeCount: 18 },
  { id: '5', name: 'Khungi Rancho', totalExpenses: 2100.00, employeeCount: 8 },
];

export const mockAuditLogs: AuditLog[] = [
    { id: '1', user: 'Juan Pérez', userAvatar: 'JP', action: 'inicio de sesion', details: 'IP: 192.168.1.1', date: '2024-05-21 09:00:15' },
    { id: '2', user: 'Maria Rodriguez', userAvatar: 'MR', action: 'añadir gasto', details: 'ID Gasto: 2, Monto: $65.00', date: '2024-05-20 15:30:00' },
    { id: '3', user: 'Carlos Gomez', userAvatar: 'CG', action: 'editar gasto', details: 'ID Gasto: 3, Justificación: Corrección de monto', date: '2024-05-19 11:45:23' },
    { id: '4', user: 'Ana Torres', userAvatar: 'AT', action: 'cierre de sesión', details: 'Duración: 2h 15m', date: '2024-05-18 17:05:10' },
    { id: '5', user: 'Juan Pérez', userAvatar: 'JP', action: 'añadir gasto', details: 'ID Gasto: 6, Monto: $45.30', date: '2024-05-21 10:20:05' },
];
