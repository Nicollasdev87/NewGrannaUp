
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
}


const COLORS = ['#8c2bee', '#eab308', '#ec4899', '#0ea5e9'];

const Dashboard: React.FC<DashboardProps> = ({ userName, transactions, goals, investments, goalContributions, onOpenAddTransactionModal, onViewAllTransactions }) => {

  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Alimentação': return 'bg-orange-500';
      case 'Trabalho': return 'bg-blue-500';
      case 'Transporte': return 'bg-indigo-500';
      case 'Lazer': return 'bg-pink-500';
      case 'Renda Extra': return 'bg-teal-500';
      case 'Viagem': return 'bg-purple-500';
      case 'Saúde': return 'bg-red-500';
      case 'Educação': return 'bg-violet-500';
      default: return 'bg-slate-400';
    }
  };

  const getCategoryHex = (category: string) => {
    switch (category) {
      case 'Alimentação': return '#a855f7'; // Purple 500
      case 'Trabalho': return '#8b5cf6';    // Violet 500
      case 'Transporte': return '#7c3aed';   // Violet 600
      case 'Lazer': return '#6366f1';        // Indigo 500 (Combina com roxo)
      case 'Renda Extra': return '#d8b4fe';  // Purple 300
      case 'Viagem': return '#c084fc';       // Fuchsia 400
      case 'Saúde': return '#9333ea';        // Purple 600
      case 'Educação': return '#4f46e5';     // Indigo 600
      default: return '#7e22ce';            // Purple 700
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

  // Chart Data: Last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return {
      month: d.getMonth(),
      year: d.getFullYear(),
      label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
      income: 0,
      expense: 0,
      invested: 0
    };
  });

  transactions.forEach(tx => {
    if (!tx.date.includes('-')) return;
    const date = new Date(tx.date + 'T00:00:00');
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthData = last6Months.find(m => m.month === month && m.year === year);
    if (monthData) {
      if (tx.type === 'income') monthData.income += tx.value;
      else monthData.expense += tx.value;
    }
  });

  // Calculate monthly investments: goal contributions + transactions in 'Investimento' category
  (goalContributions || []).forEach(c => {
    if (!c.date || !c.date.includes('-')) return;
    const date = new Date(c.date + 'T00:00:00');
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthData = last6Months.find(m => m.month === month && m.year === year);
    if (monthData) {
      monthData.invested += Number(c.amount || 0);
    }
  });

  (transactions || []).filter(tx => tx.category === 'Investimento').forEach(tx => {
    if (!tx.date || !tx.date.includes('-')) return;
    const date = new Date(tx.date + 'T00:00:00');
    const month = date.getMonth();
    const year = date.getFullYear();
    const monthData = last6Months.find(m => m.month === month && m.year === year);
    if (monthData) {
      monthData.invested += Number(tx.value || 0);
    }
  });

  const fullChartData = last6Months.map(m => ({
    month: m.label.charAt(0).toUpperCase() + m.label.slice(1),
    Receita: m.income,
    Despesa: m.expense,
    Investido: m.invested
  }));

  // Show only last 3 months if the first 3 months are empty
  const isEarlyDataEmpty = fullChartData.slice(0, 3).every(d => d.Receita === 0 && d.Despesa === 0 && d.Investido === 0);
  const chartData = isEarlyDataEmpty ? fullChartData.slice(3) : fullChartData;


  const EmptyState = ({ message = "SEM LANÇAMENTOS", small = false }) => (
    <div className={`flex flex-col items-center justify-center ${small ? 'py-1' : 'py-8'} text-slate-400 dark:text-slate-500 box-border w-full`}>
      {!small && <span className="material-symbols-outlined !text-4xl mb-2 opacity-20">database_off</span>}
      <p className={`${small ? 'text-[8px]' : 'text-[10px]'} font-bold uppercase tracking-widest`}>{message}</p>
    </div>
  );

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryHex(data.name) }}></span>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{data.name}:</span>
          <span className="text-xs font-bold text-slate-900 dark:text-white">{payload[0].value}%</span>
        </div>
      );
    }
    return null;
  };


  // Pie Chart Data
  const categoryTotals: Record<string, number> = {};
  currentMonthTransactions
    .filter(tx => tx.type === 'expense')
    .forEach(tx => {
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.value;
    });

  const totalMonthlyExpenses = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const pieData = totalMonthlyExpenses > 0
    ? Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: Math.round((value / totalMonthlyExpenses) * 100)
    })).sort((a, b) => b.value - a.value).slice(0, 4)
    : [];


  // Main Goal
  const featuredGoal = goals.length > 0 ? goals.sort((a, b) => (b.currentValue / b.targetValue) - (a.currentValue / a.targetValue))[0] : null;

  const handleGetAdvice = async () => {
    setIsLoadingAdvice(true);
    const result = await getFinancialAdvice(transactions, goals);
    setAdvice(result);
    setIsLoadingAdvice(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr.includes('-')) return dateStr;
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    return `${day} ${monthNames[dateObj.getMonth()]}`;
  };


  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-24">
        <div>
          <h2 className="text-2xl font-bold text-primary uppercase tracking-wider mb-2">Dashboard</h2>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Olá, {userName}! 👋</h1>

          <p className="text-slate-500 dark:text-slate-400">Aqui está o resumo da sua vida financeira hoje.</p>
        </div>
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
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-full">
              <span className="material-symbols-outlined text-primary !text-xl">trending_up</span>
            </div>
          </div>
          {monthlyIncome > 0 ? (
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(monthlyIncome)}</h3>
              <p className="text-xs text-primary font-semibold mt-1 uppercase tracking-tight">Mês atual</p>
            </div>
          ) : <EmptyState message="SEM RECEITAS" small />}
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between min-h-[140px]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Despesas</p>
            <div className="p-2 bg-purple-100/50 dark:bg-purple-900/30 rounded-full">
              <span className="material-symbols-outlined text-purple-600 !text-xl">trending_down</span>
            </div>
          </div>
          {monthlyExpenses > 0 ? (
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(monthlyExpenses)}</h3>
              <p className="text-xs text-purple-600 font-semibold mt-1 uppercase tracking-tight">Mês atual</p>
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
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
              <span className="material-symbols-outlined text-blue-600 !text-xl">savings</span>
            </div>
          </div>
          {totalInvested > 0 ? (
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalInvested)}</h3>
              <p className="text-xs text-blue-600 font-semibold mt-1 uppercase tracking-tight">Patrimônio</p>
            </div>
          ) : <EmptyState message="SEM INVESTIMENTOS" small />}
        </div>
      </div>




      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Receitas x Despesas</h3>
            <span className="text-sm text-slate-500">Últimos 6 meses</span>
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
                  <Bar dataKey="Despesa" fill="#d8b4fe" radius={[4, 4, 0, 0]} barSize={20} />
                  <Line type="monotone" dataKey="Investido" stroke="#14b8a6" strokeWidth={3} dot={{ r: 4, fill: '#14b8a6' }} />
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
              <span className="w-3 h-3 rounded-full bg-purple-300"></span>
              <span className="text-sm text-slate-500">Despesas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-teal-500"></span>
              <span className="text-sm text-slate-500">Investido</span>
            </div>
          </div>


        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Gastos por Categoria</h3>
          <div className="h-[280px] w-full">
            {pieData.length > 0 ? (
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
                      <Cell key={`cell-${index}`} fill={getCategoryHex(entry.name)} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
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
                {transactions.slice(0, 4).map((tx) => (
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
                            <span className={`w-1.5 h-1.5 rounded-full ${getCategoryColor(tx.category)}`}></span>
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
            <div className="bg-gradient-to-br from-primary to-purple-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden group">
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


          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Investimentos</h3>
              <span className="material-symbols-outlined text-slate-400">arrow_forward</span>
            </div>
            <div className="space-y-4">
              {investments.length > 0 ? (
                investments.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${inv.color}20`, color: inv.color }}>
                      <span className="material-symbols-outlined">{inv.icon}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{inv.name}</span>
                        <span className="text-sm font-bold">R$ {inv.totalValue.toLocaleString()}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, inv.percentage)}%`, backgroundColor: inv.color }}></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : <EmptyState message="SEM DADOS" small />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
