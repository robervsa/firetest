

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string;
  color?: string;
  user_id?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: ExpenseCategory['name'];
  date: string;
  entity: string;
  user_id: string;
  receipt_url: string;
}

export interface Entity {
  id: string;
  name: string;
  totalExpenses: number;
  employeeCount: number;
  user_id?: string;
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

export type UserRole = 'admin' | 'employee';

export interface Profile {
    id: string;
    role: UserRole;
    entity_id?: string;
}

export interface User {
    id: string;
    email: string | undefined;
    role: UserRole;
    entity_id: string | null;
    entity_name?: string;
}
