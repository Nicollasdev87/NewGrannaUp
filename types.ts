
export enum AppScreen {
  DASHBOARD = 'DASHBOARD',
  TRANSACTIONS = 'TRANSACTIONS',
  GOALS = 'GOALS',
  INVESTMENTS = 'INVESTMENTS',
  PROFILE = 'PROFILE',
  SETTINGS = 'SETTINGS'
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  value: number;
  icon: string;
  paymentMethod?: string;
  installments?: string;
}

export interface Goal {
  id: string;
  title: string;
  deadline: string;
  currentValue: number;
  targetValue: number;
  category: string;
  icon: string;
  backgroundImage?: string;
  status: 'Iniciado' | 'Em Andamento' | 'Falta Pouco' | 'Essencial';
  lastContributionDate?: string;
  monthlyContribution?: number;
  completionDate?: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  amount: number;
  date: string;
}
export interface Dividend {
  id: string;
  investmentId?: string;
  assetName: string;
  value: number;
  date: string;
}


export interface Investment {
  id: string;
  name: string;
  ticker?: string;
  category: 'Ações' | 'Fundos Imobiliários' | 'Cripto' | 'Renda Fixa' | 'Internacional' | 'Outros';
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  totalValue: number;
  percentage: number;
  color: string;
  icon: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  occupation: string;
  avatar: string;
}
