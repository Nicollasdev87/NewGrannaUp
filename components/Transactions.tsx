
import React from 'react';
import { Transaction } from '../types';

interface TransactionsProps {
  transactions: Transaction[];
  onOpenAddTransactionModal: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}


const Transactions: React.FC<TransactionsProps> = ({ transactions, onOpenAddTransactionModal, onEditTransaction, onDeleteTransaction }) => {


  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Alimentação': return 'bg-orange-500';
      case 'Trabalho': return 'bg-blue-500';
      case 'Transporte': return 'bg-indigo-500';
      case 'Lazer': return 'bg-pink-500';
      case 'Renda Extra': return 'bg-teal-500';
      case 'Viagem': return 'bg-purple-500';
      default: return 'bg-slate-400';
    }
  };

  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.value, 0);

  const totalExpenses = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.value, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-24">
        <div>
          <h2 className="text-2xl font-bold text-primary uppercase tracking-wider mb-2">Transações</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie suas entradas e saídas de Outubro 2023.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium hover:bg-slate-50 transition-all">
            <span className="material-symbols-outlined !text-lg">file_upload</span>
            Importar
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium hover:bg-slate-50 transition-all">
            <span className="material-symbols-outlined !text-lg">filter_alt</span>
            Filtrar
          </button>
          <button
            onClick={onOpenAddTransactionModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-md hover:bg-primary-dark transition-all"
          >
            <span className="material-symbols-outlined !text-lg">add</span>
            Adicionar Lançamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-50 text-green-600">
              <span className="material-symbols-outlined">arrow_downward</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Receitas</p>
              <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
          <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full">Atualizado</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-50 text-red-600">
              <span className="material-symbols-outlined">arrow_upward</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Despesas</p>
              <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
          <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full">Controle</span>
        </div>

      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[11px] tracking-wider">
                <th className="p-4 w-20 text-center font-bold">Data</th>
                <th className="p-4 font-bold">Descrição</th>
                <th className="p-4 font-bold hidden sm:table-cell">Categoria</th>
                <th className="p-4 text-center font-bold">Tipo</th>
                <th className="p-4 text-right font-bold">Valor</th>
                <th className="p-4 text-right font-bold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {transactions.map((tx) => (
                <tr key={tx.id} className="group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="p-4 text-center">
                    <span className="text-sm font-bold block">{tx.date.includes('-') ? tx.date.split('-')[2] : tx.date.split(' ')[0]}</span>
                    <span className="text-[10px] text-slate-400 uppercase">
                      {tx.date.includes('-')
                        ? (['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'])[new Date(tx.date + 'T00:00:00').getMonth()]
                        : tx.date.split(' ')[1]}
                    </span>
                  </td>



                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${tx.type === 'income' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                        <span className="material-symbols-outlined !text-[20px]">{tx.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{tx.description}</p>
                        <p className="text-xs text-slate-400 sm:hidden flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${getCategoryColor(tx.category)}`}></span>
                          {tx.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${getCategoryColor(tx.category)}`}></span>
                      {tx.category}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${tx.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {tx.type === 'income' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className={`p-4 text-right text-sm font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'income' ? '+' : '-'} R$ {tx.value.toFixed(2)}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        className="p-1.5 text-slate-400 hover:text-primary"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center text-xs text-slate-500">
          <span>Mostrando 1 a {transactions.length} de {transactions.length} resultados</span>
          <div className="flex gap-1">
            <button className="p-1 rounded-md border border-slate-200 dark:border-slate-600 disabled:opacity-30" disabled><span className="material-symbols-outlined text-sm">chevron_left</span></button>
            <button className="p-1 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-white"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
