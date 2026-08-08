export type ExpenseCategory = 'maintenance' | 'utilities' | 'taxes' | 'renovation' | 'management' | 'other';

export interface Expense {
  id: string;
  landlordId: string;
  houseId?: string;
  houseTitle?: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  date: string;
}
