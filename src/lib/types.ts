
export interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory['name'];
  date: string;
  entity: string;
  user: string;
}

export interface Entity {
  id: string;
  name: string;
  totalExpenses: number;
  employeeCount: number;
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
