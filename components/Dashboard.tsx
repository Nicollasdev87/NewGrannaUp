
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Bar, Line } from 'recharts';
import { Transaction, Goal, Investment, GoalContribution } from '../types';
import { getFinancialAdvice } from '../services/geminiService';

interface DashboardProps {
  userName: string;
  transactions: Transaction[];
  goals: Goal[];
  investments: Investment[];
  goalContributions: GoalContribution[];
  onOpenAddTransactionModal: () => void;
  onViewAllTransactions: () => void;
  onNavigateToGoals: () => void;
}


const COLORS = ['#8c2bee', '#eab308', '#ec4899', '#0ea5e9'];

// Helper Functions
const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
};

const formatCompactNumber = (number: number) => {
  return Intl.NumberFormat('pt-BR', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(number);
};

const formatDate = (dateStr: string) => {
  if (!dateStr.includes('-')) return dateStr;
  const [year, month, day] = dateStr.split('-');
  const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  return `${day} ${monthNames[dateObj.getMonth()]} / ${year.slice(-2)}`;
};

const Dashboard: React.FC<DashboardProps> = ({ userName, transactions, goals, investments, goalContributions, onOpenAddTransactionModal, onViewAllTransactions, onNavigateToGoals }) => {

  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  // Filter State
  const [filterType, setFilterType] = useState<'current-month' | 'last-month' | 'all' | 'custom'>('all');
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [showCustomRange, setShowCustomRange] = useState(false);

  // Filter Logic
  const getFilteredTransactions = () => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (filterType) {
      case 'current-month':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'last-month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'all':
        return transactions;
      case 'custom':
        if (!customRange.start || !customRange.end) return transactions;
        start = new Date(customRange.start + 'T00:00:00');
        end = new Date(customRange.end + 'T23:59:59');
        break;
    }

    if (filterType !== 'all') {
      return transactions.filter(tx => {
        if (!tx.date.includes('-')) return false;
        const txDate = new Date(tx.date + 'T12:00:00');
        return txDate >= start && txDate <= end;
      });
    }
    return transactions;
  };

  const filteredTransactions = getFilteredTransactions();

  // Calculations based on filtered data
  const filteredIncome = filteredTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.value, 0);

  const filteredExpenses = filteredTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.value, 0);

  // Labels based on filter
  const getPeriodLabel = () => {
    switch (filterType) {
      case 'current-month': return 'Neste Mês';
      case 'last-month': return 'No Último Mês';
      case 'all': return 'Acumulado';
      case 'custom': return 'No Período';
      default: return 'No Período';
    }
  };

  const periodLabel = getPeriodLabel();

  const getCategoryColor = (categoryName: string) => {
    // This function seems to return Tailwind classes like 'bg-orange-500' based on old logic.
    // However, custom categories return hex codes. 
    // If we want to support both, we need to check if we can return a style object or just hex.
    // For now, let's return a default tailwind class if not found, but we should probably refactor usages to use inline styles for dynamic colors.
    // BUT! getCategoryColor is used for the small dot in the transactions table. 
    return 'bg-primary'; // Default fallback class
  };

  const getCategoryStyle = (categoryName: string) => {
    // Safe fallback
    switch (categoryName) {
      case 'Alimentação': return { backgroundColor: '#f97316' };
      case 'Trabalho': return { backgroundColor: '#3b82f6' };
      case 'Transporte': return { backgroundColor: '#6366f1' };
      case 'Lazer': return { backgroundColor: '#ec4899' };
      case 'Renda Extra': return { backgroundColor: '#14b8a6' };
      case 'Viagem': return { backgroundColor: '#a855f7' };
      default: return { backgroundColor: '#94a3b8' };
    }
  };

  const getCategoryHex = (categoryName: string) => {
    // Safe fallback
    switch (categoryName) {
      case 'Alimentação': return '#f97316';
      case 'Trabalho': return '#3b82f6';
      case 'Transporte': return '#6366f1';
      case 'Lazer': return '#ec4899';
      case 'Renda Extra': return '#14b8a6';
      case 'Viagem': return '#a855f7';
      default: return '#94a3b8';
    }
  };



  // Financial Calculations
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentMonthTransactions = transactions.filter(tx => {
    if (!tx.date.includes('-')) return false;
    const date = new Date(tx.date + 'T00:00:00');
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });

  const monthlyIncome = currentMonthTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.value, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.value, 0);

  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.value, 0);

  const totalExpenses = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.value, 0);

  const totalInvested = investments.reduce((sum, inv) => sum + inv.totalValue, 0);
  const totalInGoals = goals.reduce((sum, goal) => sum + goal.currentValue, 0);

  const currentBalance = totalIncome - totalExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100) : 0;

  // Pie Chart Data
  const categoryTotals: Record<string, number> = {};
  filteredTransactions // CHANGED: Was currentMonthTransactions
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.value;
    });

  const totalMonthlyExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

  // --- Dynamic Chart Data Generation ---

  const getChartData = () => {
    // 1. Determine Date Range
    let start = new Date();
    let end = new Date();
    let mode: 'daily' | 'monthly' = 'monthly';

    const now = new Date();

    if (filterType === 'current-month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      mode = 'daily';
    } else if (filterType === 'last-month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0);
      mode = 'daily';
    } else if (filterType === 'custom' && customRange.start && customRange.end) {
      start = new Date(customRange.start + 'T00:00:00');
      end = new Date(customRange.end + 'T23:59:59');
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      mode = diffDays <= 35 ? 'daily' : 'monthly';
    } else {
      // All time or fallback -> Default to last 6 months equivalent or all available data
      // For 'all', we should look at the very first transaction or goal contribution
      // To keep it simple and performant, let's default 'all' to 'monthly' grouping over all data.
      mode = 'monthly';
      // Find min date
      const allDates = [
        ...transactions.map(t => t.date),
        ...goalContributions.map(g => g.date),
        ...investments.map(i => i.date).filter(Boolean) as string[]
      ].filter(d => d.includes('-'));

      if (allDates.length > 0) {
        allDates.sort();
        start = new Date(allDates[0] + 'T00:00:00');
        end = new Date(); // Up to now
      } else {
        start = new Date(now.getFullYear(), now.getMonth() - 5, 1); // Default 6 months
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      }
    }

    // 2. Generate Buckets
    const dataMap = new Map<string, { label: string, income: number, expense: number, invested: number, originalDate: Date }>();

    const currentDate = new Date(start);
    // Reset time to avoid infinite loops if start includes time
    if (mode === 'daily') currentDate.setHours(0, 0, 0, 0);
    else currentDate.setDate(1); // Start of month for monthly loop

    while (currentDate <= end) {
      let key = '';
      let label = '';

      if (mode === 'daily') {
        key = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD
        label = `${currentDate.getDate()}/${currentDate.getMonth() + 1}`;
      } else {
        key = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
        label = currentDate.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '');
        label = label.charAt(0).toUpperCase() + label.slice(1);
      }

      dataMap.set(key, {
        label,
        income: 0,
        expense: 0,
        invested: 0,
        originalDate: new Date(currentDate)
      });

      if (mode === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }

    // 3. Populate Buckets
    // Use the SAME filter applied to summaries (getFilteredTransactions)? 
    // Actually, for 'All' we want all transactions. For others, we want filtered.
    // The previous block `filteredTransactions` already respects the Logic.
    // So we can iterate `filteredTransactions`.

    filteredTransactions.forEach(tx => {
      if (!tx.date.includes('-')) return;
      const txDate = new Date(tx.date + 'T12:00:00'); // Mid-day to avoid TZ issues

      let key = '';
      if (mode === 'daily') {
        key = tx.date; // YYYY-MM-DD matches
      } else {
        key = `${txDate.getFullYear()}-${txDate.getMonth()}`;
      }

      if (dataMap.has(key)) {
        const entry = dataMap.get(key)!;
        if (tx.type === 'income') entry.income += tx.value;
        else if (tx.type === 'expense') entry.expense += tx.value;
      } else if (filterType === 'all') {
        // For 'all' we might have missed pre-filling buckets if logic was sloppy? 
        // Or if transactions fall outside the range we determined (unlikely for 'all').
        // But actually, for 'all' we need to be careful with the sorting above.
      }
    });

    // Handle Investments (Goal Contributions + Transactions category='Investimento') based on Filter
    // We should filter these by date too if not 'all'
    const relevantContributions = filterType === 'all' ? goalContributions : goalContributions.filter(c => {
      const d = new Date(c.date + 'T12:00:00');
      return d >= start && d <= end;
    });

    relevantContributions.forEach(c => {
      if (!c.date || !c.date.includes('-')) return;
      const d = new Date(c.date + 'T12:00:00');
      let key = '';
      if (mode === 'daily') key = c.date;
      else key = `${d.getFullYear()}-${d.getMonth()}`;

      if (dataMap.has(key)) {
        dataMap.get(key)!.invested += Number(c.amount || 0);
      }
    });

    const relevantInvTransactions = filterType === 'all' ? transactions : filteredTransactions;
    relevantInvTransactions.filter(tx => tx.category === 'Investimento' || tx.type === 'investment').forEach(tx => {
      if (!tx.date || !tx.date.includes('-')) return;
      const d = new Date(tx.date + 'T12:00:00');
      let key = '';
      if (mode === 'daily') key = tx.date;
      else key = `${d.getFullYear()}-${d.getMonth()}`;

      if (dataMap.has(key)) {
        dataMap.get(key)!.invested += Number(tx.value || 0);
      }
    });


    // 4. Format for Recharts
    return Array.from(dataMap.values()).map(item => ({
      month: item.label, // Recharts XAxis currently mapped to 'month'
      Receita: item.income,
      Despesa: item.expense,
      Investido: item.invested
    }));
  };

  const chartData = getChartData();

  const EmptyState = ({ message = "SEM LANÇAMENTOS", small = false }) => (
    <div className={`flex flex-col items-center justify-center ${small ? 'py-1' : 'py-8'} text-slate-400 dark:text-slate-500 box-border w-full`}>
      {!small && <span className="material-symbols-outlined !text-4xl mb-2 opacity-20">database_off</span>}
      <p className={`${small ? 'text-[8px]' : 'text-[10px]'} font-bold uppercase tracking-widest`}>{message}</p>
    </div>
  );

  // FIXED COLORS PALETTE
  const CHART_COLORS = ['#8c2bee', '#ec4899', '#3b82f6', '#06b6d4', '#f59e0b', '#7c3aed'];

  const pieData = totalMonthlyExpenses > 0
    ? Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: value,
      percent: (value / totalMonthlyExpenses) * 100
    }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4)
      .map((item, index) => ({
        ...item,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }))
    : [];

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }}></span>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{data.name}:</span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(payload[0].value)}</span>
            <span className="text-xs text-slate-500 font-medium">({data.percent.toFixed(1)}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Investment Chart Data
  const investmentCategoryTotals: Record<string, number> = {};
  investments.forEach(inv => {
    investmentCategoryTotals[inv.category] = (investmentCategoryTotals[inv.category] || 0) + inv.totalValue;
  });

  // Calculate data and filter out zero values
  // Calculate data and filter out zero values
  const investmentPieRawData = Object.entries(investmentCategoryTotals)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value], index) => {
      // Semantic Color Mapping
      let color = CHART_COLORS[index % CHART_COLORS.length];
      const n = name.toLowerCase();
      if (n.includes('cripto') || n.includes('bitcoin')) color = '#f59e0b'; // Amber-500
      else if (n.includes('ação') || n.includes('acoes') || n.includes('ações')) color = '#22c55e'; // Green-500
      else if (n.includes('fundo') || n.includes('fii')) color = '#3b82f6'; // Blue-500
      else if (n.includes('renda fixa') || n.includes('tesouro') || n.includes('cdb')) color = '#06b6d4'; // Cyan-500
      else if (n.includes('etf')) color = '#f97316'; // Orange-500
      else if (n.includes('exterior') || n.includes('bdr')) color = '#8b5cf6'; // Violet-500

      return {
        name,
        value,
        percent: (value / totalInvested) * 100,
        color
      };
    });

  // Recent Investment Transactions (with fallback to virtual ones from current investments)
  const realInvestmentTransactions = filteredTransactions
    .filter(tx => tx.type === 'investment' || tx.category === 'Investimento');

  const virtualInvestmentTransactions = investments.map(inv => ({
    id: `virtual-${inv.id}`,
    date: (inv as any).date || new Date().toISOString().split('T')[0],
    description: `Aporte: ${inv.ticker || inv.name}`,
    category: 'Investimento',
    type: 'investment' as const,
    value: inv.quantity * inv.purchasePrice,
    icon: inv.icon,
    paymentMethod: 'Saldo'
  }));

  // Combine real and virtual, avoiding duplicates based on description
  const recentInvestmentTransactions = [
    ...realInvestmentTransactions,
    ...virtualInvestmentTransactions.filter(vt => !realInvestmentTransactions.some(rt => rt.description.includes(vt.description)))
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 4);

  // Main Goal (Featured Randomly per Month)
  const getFeaturedGoal = () => {
    if (goals.length === 0) return null;
    if (goals.length === 1) return goals[0];

    const seed = new Date().getFullYear() * 100 + new Date().getMonth();
    // Simple Pseudo-random using modulo
    const index = seed % goals.length;
    return goals[index];
  };

  const featuredGoal = getFeaturedGoal();

  const handleGetAdvice = async () => {
    setIsLoadingAdvice(true);
    const result = await getFinancialAdvice(transactions, goals);
    setAdvice(result);
    setIsLoadingAdvice(false);
  };






  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mt-6">
        <div>
          <h2 className="text-2xl font-bold text-primary uppercase tracking-wider mb-2">Dashboard</h2>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Olá, {userName.split(' ')[0]} <span className="text-xl">👋</span>
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-1">Bem vindo ao GranaUp, seu controle financeiro</p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="flex gap-3">
            <button
              onClick={handleGetAdvice}
              disabled={isLoadingAdvice}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined !text-lg text-primary">psychology</span>
              {isLoadingAdvice ? 'Analisando...' : 'IA Insights'}
            </button>
            <button
              onClick={onOpenAddTransactionModal}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark transition-colors text-sm font-bold"
            >
              <span className="material-symbols-outlined !text-lg">add</span>
              Novo Lançamento
            </button>
          </div>

          <div className="relative flex flex-col items-end">
            {/* Minimalist Filter */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm w-fit z-40 relative">
              <button
                onClick={() => { setFilterType('all'); setShowCustomRange(false); }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filterType === 'all' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                Todo período
              </button>
              <button
                onClick={() => { setFilterType('current-month'); setShowCustomRange(false); }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${filterType === 'current-month' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
              >
                Este mês
              </button>
              <button
                onClick={() => { setFilterType('custom'); setShowCustomRange(!showCustomRange); }}
                className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${filterType === 'custom' ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                title="Período personalizado"
              >
                <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              </button>
            </div>

            {showCustomRange && (
              <div className="absolute top-full mt-2 right-0 p-3 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 flex gap-2 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                <input
                  type="date"
                  value={customRange.start}
                  onChange={(e) => setCustomRange(p => ({ ...p, start: e.target.value }))}
                  className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-sm p-2 focus:ring-2 focus:ring-primary w-32"
                />
                <span className="text-slate-400 self-center">até</span>
                <input
                  type="date"
                  value={customRange.end}
                  onChange={(e) => setCustomRange(p => ({ ...p, end: e.target.value }))}
                  className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-sm p-2 focus:ring-2 focus:ring-primary w-32"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {advice && (
        <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex gap-4 items-start animate-in slide-in-from-top duration-300">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shrink-0 text-white">
            <span className="material-symbols-outlined">auto_awesome</span>
          </div>
          <div>
            <h4 className="font-bold text-primary mb-1">Dica da IA Granaup</h4>
            <p className="text-sm text-slate-700 dark:text-slate-300 italic whitespace-pre-line">{advice}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Receitas</p>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <span className="material-symbols-outlined text-blue-600 !text-xl">trending_up</span>
            </div>
          </div>
          {filteredIncome > 0 ? (
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(filteredIncome)}</h3>
              <p className="text-xs text-blue-600 font-semibold mt-1 uppercase tracking-tight">{periodLabel}</p>
            </div>
          ) : <EmptyState message="SEM RECEITAS" small />}
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Despesas</p>
            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-full">
              <span className="material-symbols-outlined text-rose-500 !text-xl">trending_down</span>
            </div>
          </div>
          {filteredExpenses > 0 ? (
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(filteredExpenses)}</h3>
              <p className="text-xs text-rose-500 font-semibold mt-1 uppercase tracking-tight">{periodLabel}</p>
            </div>
          ) : <EmptyState message="SEM DESPESAS" small />}
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total em Metas</p>
            <div className="p-2 bg-primary/10 rounded-full">
              <span className="material-symbols-outlined text-primary !text-xl">flag</span>
            </div>
          </div>
          {totalInGoals > 0 ? (
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalInGoals)}</h3>
              <p className="text-xs text-primary font-semibold mt-1 uppercase tracking-tight">Acumulado</p>
            </div>
          ) : <EmptyState message="SEM METAS ATIVAS" small />}
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Investido</p>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
              <span className="material-symbols-outlined text-emerald-500 !text-xl">savings</span>
            </div>
          </div>
          {totalInvested > 0 ? (
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalInvested)}</h3>
              <p className="text-xs text-emerald-500 font-semibold mt-1 uppercase tracking-tight">Patrimônio</p>
            </div>
          ) : <EmptyState message="SEM INVESTIMENTOS" small />}
        </div>
      </div>




      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Receitas x Despesas</h3>
            <span className="text-sm text-slate-500">{periodLabel}</span>
          </div>
          <div className="h-[300px] w-full">
            {transactions.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#756189' }} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="Receita" fill="#8c2bee" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="Despesa" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={20} />
                  <Line type="monotone" dataKey="Investido" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} />
                </ComposedChart>
              </ResponsiveContainer>
            ) : <EmptyState message="SEM LANÇAMENTOS PARA O GRÁFICO" />}
          </div>



          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              <span className="text-sm text-slate-500">Receitas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ec4899' }}></span>
              <span className="text-sm text-slate-500">Despesas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }}></span>
              <span className="text-sm text-slate-500">Investido</span>
            </div>
          </div>


        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Gastos por Categoria</h3>
          <div className="h-[280px] w-full relative">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <p className="text-xs text-slate-500 font-medium uppercase">Total</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCompactNumber(totalMonthlyExpenses)}</p>
                </div>
              </>
            ) : <EmptyState message="SEM GASTOS POR CATEGORIA" />}
          </div>


        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="text-lg font-bold">Últimas Transações</h3>
            <button
              onClick={onViewAllTransactions}
              className="text-sm text-primary font-medium hover:underline"
            >
              Ver todas
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-700/50 text-slate-500 uppercase text-[10px] tracking-wider">
                  <th className="px-6 py-3">Data</th>
                  <th className="px-6 py-3">Descrição</th>
                  <th className="px-6 py-3 text-center">Método</th>
                  <th className="px-6 py-3 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredTransactions.slice(0, 8).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDate(tx.date)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-lg ${tx.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          <span className="material-symbols-outlined !text-[20px]">{tx.icon}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{tx.description}</span>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full" style={getCategoryStyle(tx.category)}></span>
                            <span className="text-[10px] text-slate-400 uppercase tracking-wide">{tx.category}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                        {tx.paymentMethod || '-'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.value)}
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          {featuredGoal ? (
            <div
              onClick={onNavigateToGoals}
              className="bg-gradient-to-br from-primary to-purple-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined !text-9xl">{featuredGoal.icon}</span>
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                    <span className="material-symbols-outlined text-white">{featuredGoal.icon}</span>
                  </div>
                  <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">Meta do Mês</span>
                </div>
                <h4 className="text-lg font-bold mb-1">{featuredGoal.title}</h4>
                <p className="text-purple-100 text-sm mb-6">Foco total no objetivo!</p>
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span>{formatCurrency(featuredGoal.currentValue)}</span>
                  <span>{formatCurrency(featuredGoal.targetValue)}</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2 mb-2">
                  <div className="bg-white h-2 rounded-full" style={{ width: `${Math.min(100, (featuredGoal.currentValue / featuredGoal.targetValue) * 100)}%` }}></div>
                </div>
                <p className="text-xs text-purple-100 text-right">{Math.round((featuredGoal.currentValue / featuredGoal.targetValue) * 100)}% alcançado</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-100 dark:bg-slate-700 p-6 rounded-xl text-center flex flex-col items-center justify-center min-h-[220px]">
              <span className="material-symbols-outlined text-4xl text-slate-400 mb-2">add_task</span>
              <p className="text-sm text-slate-500">Nenhuma meta ativa. Que tal criar uma?</p>
            </div>
          )}


          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Carteira Atual</h3>
              {investments.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 dark:bg-primary/20 rounded-lg border border-primary/20">
                  <span className="material-symbols-outlined text-primary dark:text-white text-sm">account_balance_wallet</span>
                  <span className="text-sm font-bold text-primary dark:text-white">
                    {formatCurrency(totalInvested)}
                  </span>
                </div>
              )}
            </div>

            <div className="h-[250px] w-full relative">
              {investmentPieRawData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={investmentPieRawData}
                        cx="50%"
                        cy="50%"
                        innerRadius={75} // Thinner donut
                        outerRadius={95} // Matched to Expenses Chart
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {investmentPieRawData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <p className="text-xs text-slate-500 font-medium uppercase">Total</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCompactNumber(totalInvested)}</p>
                  </div>
                </>
              ) : (
                <EmptyState message="SEM INVESTIMENTOS" small />
              )}
            </div>

            <div className="mt-6 border-t border-slate-100 dark:border-slate-700 pt-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Últimos Aportes</h4>
                {recentInvestmentTransactions.length > 0 && <span className="text-[10px] text-slate-400 font-medium">Recentes</span>}
              </div>

              {recentInvestmentTransactions.length > 0 ? (
                <div className="space-y-4">
                  {recentInvestmentTransactions.map(tx => (
                    <div key={tx.id} className="flex items-center justify-between text-sm group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 p-2 rounded-lg transition-colors -mx-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40 transition-colors">
                          <span className="material-symbols-outlined !text-[20px]">{tx.icon}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700 dark:text-slate-200">{tx.description}</p>
                          <p className="text-xs text-slate-400">{formatDate(tx.date)} • {tx.paymentMethod || 'Outros'}</p>
                        </div>
                      </div>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {formatCurrency(tx.value)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 dark:bg-slate-700/30 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
                  Nenhum aporte registrado recentemente.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
