
import { Category } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
    { id: '1', name: 'Alimentação', color: '#f97316', icon: 'restaurant', type: 'expense', userId: 'system' },
    { id: '2', name: 'Trabalho', color: '#3b82f6', icon: 'work', type: 'income', userId: 'system' },
    { id: '3', name: 'Lazer', color: '#eab308', icon: 'movie', type: 'expense', userId: 'system' },
    { id: '4', name: 'Transporte', color: '#8b5cf6', icon: 'directions_car', type: 'expense', userId: 'system' },
    { id: '5', name: 'Saúde', color: '#ef4444', icon: 'medication', type: 'expense', userId: 'system' },
    { id: '6', name: 'Educação', color: '#14b8a6', icon: 'school', type: 'expense', userId: 'system' },
    { id: '7', name: 'Moradia', color: '#6366f1', icon: 'home', type: 'expense', userId: 'system' },
    { id: '8', name: 'Investimentos', color: '#22c55e', icon: 'savings', type: 'expense', userId: 'system' },
    { id: '9', name: 'Pagamentos', color: '#64748b', icon: 'payments', type: 'expense', userId: 'system' },
    { id: '10', name: 'Outros', color: '#94a3b8', icon: 'more_horiz', type: 'expense', userId: 'system' }
];
