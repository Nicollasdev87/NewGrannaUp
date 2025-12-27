import React, { useState } from 'react';
import { Goal } from '../types';

interface GoalsProps {
  goals: Goal[];
  onOpenAddGoalModal: () => void;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onAddContribution: (goal: Goal) => void;
  onViewHistory: (goal: Goal) => void;
}


const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'Viagem':
      return { color: 'text-sky-600', bg: 'bg-sky-600' };
    case 'Veículo':
      return { color: 'text-rose-600', bg: 'bg-rose-600' };
    case 'Casa':
      return { color: 'text-emerald-600', bg: 'bg-emerald-600' };
    case 'Educação':
      return { color: 'text-violet-600', bg: 'bg-violet-600' };
    case 'Segurança':
      return { color: 'text-slate-600', bg: 'bg-slate-600' };
    case 'Lazer':
      return { color: 'text-amber-600', bg: 'bg-amber-600' };
    default:
      return { color: 'text-primary', bg: 'bg-primary' };
  }
};

const Goals: React.FC<GoalsProps> = ({ goals, onOpenAddGoalModal, onEdit, onDelete, onAddContribution, onViewHistory }) => {

  const [showAllActive, setShowAllActive] = useState(false);

  const activeGoals = goals.filter(g => g.currentValue < g.targetValue);
  const completedGoals = goals.filter(g => g.currentValue >= g.targetValue);

  const displayedActiveGoals = showAllActive ? activeGoals : activeGoals.slice(0, 3);

  const renderGoalCard = (goal: Goal, isCompleted: boolean = false) => {
    const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
    const style = getCategoryStyles(goal.category);

    return (
      <div key={goal.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all p-6 flex flex-col gap-4 group relative overflow-hidden">
        {goal.backgroundImage && (
          <>
            <div
              className="absolute inset-0 z-0 opacity-60 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none"
              style={{
                backgroundImage: `url(${goal.backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            ></div>
            <div className="absolute inset-0 z-0 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-800 dark:via-slate-800/80 pointer-events-none"></div>
          </>
        )}

        <div className="absolute top-4 right-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(goal)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-500 hover:text-primary hover:bg-white dark:hover:bg-slate-800 shadow-sm backdrop-blur-sm transition-colors"
            title="Editar"
          >
            <span className="material-symbols-outlined !text-sm">edit</span>
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-500 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 shadow-sm backdrop-blur-sm transition-colors"
            title="Excluir"
          >
            <span className="material-symbols-outlined !text-sm">delete</span>
          </button>
        </div>

        <div className="relative z-10 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 shadow-sm border border-slate-100 dark:border-slate-600 ${style.color}`}>
                <span className="material-symbols-outlined text-[28px]">{goal.icon}</span>
              </div>
              <div className={`w-8 h-1 rounded-full ${style.bg} opacity-80`}></div>
            </div>

            <div className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wide ${isCompleted ? 'bg-emerald-100 text-emerald-700' :
              goal.status === 'Essencial' ? 'bg-emerald-100 text-emerald-700' :
                goal.status === 'Falta Pouco' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
              }`}>
              {isCompleted ? 'Concluída' : goal.status}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold group-hover:text-primary transition-colors mb-1">{goal.title}</h3>
            <div className="flex flex-col items-start gap-1">
              {isCompleted && goal.completionDate ? (
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/40 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1">
                  <span className="material-symbols-outlined !text-[12px]">celebration</span>
                  Concluída em: {new Date(goal.completionDate).toLocaleDateString('pt-BR')}
                </span>
              ) : (
                <>
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-700/80 backdrop-blur-sm px-2 py-0.5 rounded-md">
                    Prazo: {goal.deadline}
                  </span>
                  {goal.monthlyContribution && goal.targetValue > goal.currentValue && (
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-900/40 backdrop-blur-sm px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="material-symbols-outlined !text-[12px]">calendar_month</span>
                      Previsão: {(() => {
                        const remaining = goal.targetValue - goal.currentValue;
                        const months = Math.ceil(remaining / goal.monthlyContribution);
                        const date = new Date();
                        date.setMonth(date.getMonth() + months);
                        return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
                      })()}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex justify-between items-end">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">R$ {goal.currentValue.toLocaleString()}</span>
              <span className="text-sm text-slate-500 font-medium whitespace-nowrap">de R$ {goal.targetValue.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className={`text-right text-xs font-bold ${isCompleted ? 'text-emerald-500' : 'text-primary'}`}>{Math.round(progress)}%</div>
          </div>
          <div className="mt-2 pt-4 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <span className="text-xs text-slate-400">
              Último aporte: {goal.lastContributionDate ? new Date(goal.lastContributionDate).toLocaleDateString('pt-BR') : 'Nenhum'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onViewHistory(goal)}
                className="hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-full transition-colors text-slate-400 hover:text-primary"
                title="Ver Histórico"
              >
                <span className="material-symbols-outlined">history</span>
              </button>
              {!isCompleted && (
                <button
                  onClick={() => onAddContribution(goal)}
                  className="hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-full transition-colors text-slate-400 hover:text-primary"
                  title="Novo Aporte"
                >
                  <span className="material-symbols-outlined">add</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-6">
        <div>
          <h2 className="text-2xl font-bold text-primary uppercase tracking-wider mb-2">Minhas Metas</h2>
          <p className="text-slate-500 dark:text-slate-400">Visualize seus sonhos e acompanhe seu progresso financeiro.</p>
        </div>
        <button
          onClick={onOpenAddGoalModal}
          className="bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-primary/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Nova Meta
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-primary">savings</span>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Economizado</p>
            <h3 className="text-2xl font-bold">R$ {goals.reduce((acc, curr) => acc + curr.currentValue, 0).toLocaleString()}</h3>
          </div>
          {/* Mocked stat remains for now */}
          <div className="flex items-center gap-1 text-green-600 text-sm font-medium bg-green-50 w-fit px-2 py-0.5 rounded-full">
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>+15% este mês</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-blue-500">target</span>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Metas Ativas</p>
            <h3 className="text-2xl font-bold">{activeGoals.length}</h3>
          </div>
          <p className="text-sm text-slate-500 mt-2">Mantenha o foco!</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group">
          <div className="absolute right-0 top-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="material-symbols-outlined text-6xl text-emerald-500">check_circle</span>
          </div>
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Concluídas</p>
            <h3 className="text-2xl font-bold">{completedGoals.length}</h3>
          </div>
          <p className="text-sm text-slate-500 mt-2">Parabéns pelo sucesso!</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">rocket_launch</span>
            Em Andamento
          </h2>
          {activeGoals.length > 3 && (
            <button
              onClick={() => setShowAllActive(!showAllActive)}
              className="text-primary hover:text-primary-dark text-sm font-medium flex items-center gap-1 hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors"
            >
              {showAllActive ? 'Ver menos' : 'Ver todas'}
              <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${showAllActive ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedActiveGoals.map((goal) => renderGoalCard(goal, false))}

          <button
            onClick={onOpenAddGoalModal}
            className="bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-primary/5 transition-all group min-h-[280px]"
          >
            <div className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-3xl text-primary">add</span>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold mb-1">Criar Nova Meta</h3>
              <p className="text-sm text-slate-500 max-w-[200px]">Defina um novo objetivo e comece a economizar.</p>
            </div>
          </button>
        </div>
      </div>

      {completedGoals.length > 0 && (
        <div className="animate-in slide-in-from-bottom-5 duration-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
            <h2 className="text-xl font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <span className="material-symbols-outlined">emoji_events</span>
              Metas Alcançadas
            </h2>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80 hover:opacity-100 transition-opacity duration-300">
            {completedGoals.map((goal) => renderGoalCard(goal, true))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Goals;
