export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'cash' | 'bank_transfer' | 'promptpay' | 'credit_card' | 'other';

export interface Transaction {
  id?: string;
  userId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  updatedAt?: string;
}

export interface Budget {
  id?: string;
  userId: string;
  month: string; // YYYY-MM
  category: string;
  amount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  bgColor: string;
}

export interface MonthlyStats {
  totalIncome: number;
  totalExpense: number;
  netBalance: number;
  savingsRate: number;
  dailyAvgExpense: number;
  transactionCount: number;
  topExpenseCategory: { name: string; amount: number; percentage: number } | null;
  topIncomeCategory: { name: string; amount: number; percentage: number } | null;
}
