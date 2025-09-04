export type ExpenseCategory = 'comida' | 'combustible' | 'limpieza' | 'transporte' | 'oficina' | 'otro';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  entity: string;
  user: string;
}

export interface Entity {
  id: string;
  name: string;
  totalExpenses: number;
  employeeCount: number;
  avatar: string;
}

export type AuditLogAction = 'inicio de sesion' | 'cierre de sesión' | 'añadir gasto' | 'editar gasto';

export interface AuditLog {
  id: string;
  user: string;
  userAvatar: string;
  action: AuditLogAction;
  details: string;
  date: string;
}
