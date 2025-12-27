import React, { useState } from 'react';
import { Transaction, Category, CreditCard } from '../types';
import ImportModal from './ImportModal';

interface TransactionsProps {
  transactions: Transaction[];
  onOpenAddTransactionModal: () => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onDeleteMultiple: (ids: string[]) => void;
  onAddMultiple: (transactions: Omit<Transaction, 'id' | 'user_id'>[]) => void;
  categories: Category[];
  creditCards?: CreditCard[];
}

const Transactions: React.FC<TransactionsProps> = ({
  transactions,
  onOpenAddTransactionModal,
  onEditTransaction,
  onDeleteTransaction,
  onDeleteMultiple,
  onAddMultiple,
  categories,
  creditCards = []
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDatePopover, setShowDatePopover] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('');
  const [filterCard, setFilterCard] = useState('');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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

  /* Safe fallback for now as requested */
  const getCategoryStyle = (categoryName: string) => {
    // Reverting to simple switch or default to avoid crashes
    switch (categoryName) {
      case 'Alimentação': return { backgroundColor: '#f97316' }; // orange-500
      case 'Trabalho': return { backgroundColor: '#3b82f6' }; // blue-500
      case 'Transporte': return { backgroundColor: '#6366f1' }; // indigo-500
      case 'Lazer': return { backgroundColor: '#ec4899' }; // pink-500
      case 'Renda Extra': return { backgroundColor: '#14b8a6' }; // teal-500
      case 'Viagem': return { backgroundColor: '#a855f7' }; // purple-500
      default: return { backgroundColor: '#94a3b8' }; // slate-400
    }
  };

  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.value, 0);

  const totalExpenses = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.value, 0);

  const totalInvestments = transactions
    .filter(tx => tx.type === 'investment')
    .reduce((sum, tx) => sum + tx.value, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDate = true;
    if (startDate && endDate) {
      matchesDate = tx.date >= startDate && tx.date <= endDate;
    } else if (startDate) {
      matchesDate = tx.date >= startDate;
    }

    const matchesCategory = !filterCategory || tx.category === filterCategory;
    const matchesPaymentMethod = !filterPaymentMethod || tx.paymentMethod === filterPaymentMethod;
    const matchesCard = !filterCard || tx.cardBrand === filterCard || (tx.isBillPayment && tx.billCardBrand === filterCard);

    return matchesSearch && matchesDate && matchesCategory && matchesPaymentMethod && matchesCard;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredTransactions.map(tx => tx.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    // In a production app, this would use a real toast system from props or context.
    console.log(`Toast (${type}): ${message}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
        <div>
          <h2 className="text-2xl font-bold text-primary uppercase tracking-wider mb-2">Transações</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gerencie todas as suas movimentações financeiras.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium hover:bg-slate-50 transition-all"
          >
            <span className="material-symbols-outlined !text-lg">file_upload</span>
            Importar
          </button>

          <button
            onClick={onOpenAddTransactionModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-bold shadow-md hover:bg-primary-dark transition-all"
          >
            <span className="material-symbols-outlined !text-lg">add</span>
            Novo Lançamento
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <span className="material-symbols-outlined">arrow_upward</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Receitas</p>
              <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
            </div>
          </div>
          <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">Recebido</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-red-50 text-red-600">
              <span className="material-symbols-outlined">arrow_downward</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Despesas</p>
              <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
            </div>
          </div>
          <span className="px-2 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full">Gasto</span>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-50 text-green-600">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Investido</p>
              <p className="text-2xl font-bold">{formatCurrency(totalInvestments)}</p>
            </div>
          </div>
          <span className="px-2 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full">Investido</span>
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-4 duration-300">
        <div className="flex flex-wrap items-end gap-4">
          {/* Search */}
          <div className="space-y-1 w-full md:w-auto md:flex-1 min-w-[200px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Buscar</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 !text-lg">search</span>
              <input
                type="text"
                placeholder="Descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          {/* Date Range Popover */}
          <div className="space-y-1 relative">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Período</label>
            <button
              onClick={() => setShowDatePopover(!showDatePopover)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 ${startDate || endDate ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-white dark:bg-slate-900'} text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all`}
            >
              <span className="material-symbols-outlined !text-[20px]">calendar_month</span>
              <span className="hidden sm:inline">
                {startDate && endDate ? `${startDate.split('-')[2]}/${startDate.split('-')[1]} - ${endDate.split('-')[2]}/${endDate.split('-')[1]}` :
                  startDate ? `Desde ${startDate.split('-')[2]}/${startDate.split('-')[1]}` :
                    endDate ? `Até ${endDate.split('-')[2]}/${endDate.split('-')[1]}` : 'Selecionar'}
              </span>
            </button>

            {showDatePopover && (
              <div className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-20 w-64 animate-in zoom-in-95 duration-200">
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">De</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-500">Até</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => setShowDatePopover(false)}
                      className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-dark"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Backdrop to close */}
            {showDatePopover && (
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDatePopover(false)}
              ></div>
            )}
          </div>

          {/* Category */}
          <div className="space-y-1 w-full sm:w-auto min-w-[150px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Todas</option>
              <optgroup label="Receitas">
                {categories.filter(c => c.type === 'income').sort((a, b) => a.name.localeCompare(b.name)).map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </optgroup>
              <optgroup label="Despesas">
                {categories.filter(c => c.type === 'expense').sort((a, b) => a.name.localeCompare(b.name)).map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Payment Method */}
          <div className="space-y-1 w-full sm:w-auto min-w-[150px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pagamento</label>
            <select
              value={filterPaymentMethod}
              onChange={(e) => setFilterPaymentMethod(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Todos</option>
              <option value="Cartão de Crédito">Crédito</option>
              <option value="Cartão de Débito">Débito</option>
              <option value="Pix">Pix</option>
              <option value="Dinheiro">Dinheiro</option>
              <option value="TED">TED</option>
            </select>
          </div>

          {/* Card */}
          <div className="space-y-1 w-full sm:w-auto min-w-[150px]">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Cartão</label>
            <select
              value={filterCard}
              onChange={(e) => setFilterCard(e.target.value)}
              disabled={filterPaymentMethod !== 'Cartão de Crédito'}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:bg-slate-100 dark:disabled:bg-slate-800"
            >
              <option value="">Todos</option>
              {creditCards.sort((a, b) => a.name.localeCompare(b.name)).map(card => (
                <option key={card.id} value={card.name}>{card.name}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button - Only shown when filters are active */}
          {(searchTerm || startDate || endDate || filterCategory || filterPaymentMethod || filterCard) && (
            <div className="pb-1">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStartDate('');
                  setEndDate('');
                  setFilterCategory('');
                  setFilterPaymentMethod('');
                  setFilterCard('');
                }}
                className="px-4 py-2 text-primary text-xs font-bold hover:underline animate-in fade-in duration-200"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        {selectedIds.size > 0 && (
          <div className="p-4 bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between animate-in slide-in-from-top-2">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
              {selectedIds.size} {selectedIds.size === 1 ? 'selecionado' : 'selecionados'}
            </span>
            <button
              onClick={() => {
                onDeleteMultiple(Array.from(selectedIds));
                setSelectedIds(new Set());
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined !text-[16px]">delete</span>
              Excluir
            </button>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase text-[11px] tracking-wider">
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === filteredTransactions.length && filteredTransactions.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                  />
                </th>
                <th className="p-4 w-20 text-center font-bold">Data</th>
                <th className="p-4 font-bold">Descrição</th>
                <th className="p-4 font-bold hidden sm:table-cell">Categoria</th>
                <th className="p-4 text-center font-bold">Tipo</th>
                <th className="p-4 font-bold text-center">Pagamento</th>
                <th className="p-4 text-right font-bold">Valor</th>
                <th className="p-4 text-right font-bold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className={`group hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${selectedIds.has(tx.id) ? 'bg-primary/5' : ''}`}>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(tx.id)}
                      onChange={() => toggleSelect(tx.id)}
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                    />
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-sm font-bold block">
                      {tx.date.includes('-') ? tx.date.split('-')[2] : tx.date.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase font-bold">
                      {tx.date.includes('-')
                        ? (['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'])[new Date(tx.date + 'T00:00:00').getMonth()]
                        : tx.date.split(' ')[1].toUpperCase()}
                      {' / '}{tx.date.includes('-') ? tx.date.split('-')[0].slice(-2) : tx.date.split(' ')[2]?.slice(-2) || new Date().getFullYear().toString().slice(-2)}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${tx.type === 'income' ? 'bg-blue-50 text-blue-600' :
                        tx.type === 'investment' ? 'bg-green-50 text-green-600' :
                          'bg-red-50 text-red-600'
                        }`}>
                        <span className="material-symbols-outlined !text-[20px]">{tx.icon}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{tx.description}</p>
                        <p className="text-xs text-slate-400 sm:hidden flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={getCategoryStyle(tx.category)}></span>
                          {tx.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 hidden sm:table-cell text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={getCategoryStyle(tx.category)}></span>
                      {tx.category}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-full uppercase ${tx.type === 'income' ? 'bg-blue-50 text-blue-700' :
                      tx.type === 'investment' ? 'bg-green-50 text-green-700' :
                        'bg-red-50 text-red-700'
                      }`}>
                      {tx.type === 'income' ? 'Receita' : tx.type === 'investment' ? 'Investimento' : 'Despesa'}
                    </span>
                  </td>
                  <td className="p-4 text-center text-xs text-slate-500">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">{tx.cardBrand || tx.paymentMethod || '-'}</span>
                      {tx.totalInstallments && tx.totalInstallments > 1 && (
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded mt-0.5">
                          {tx.installmentNumber}/{tx.totalInstallments}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className={`p-4 text-right text-sm font-bold ${tx.type === 'income' ? 'text-blue-600' :
                    tx.type === 'investment' ? 'text-green-600' :
                      'text-red-500'
                    }`}>
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.value)}
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
        <div className="p-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <span>Mostrando 1 a {filteredTransactions.length} de {transactions.length} resultados</span>
          </div>
          <div className="flex gap-1">
            <button className="p-1 rounded-md border border-slate-200 dark:border-slate-600 disabled:opacity-30" disabled><span className="material-symbols-outlined text-sm">chevron_left</span></button>
            <button className="p-1 rounded-md border border-slate-200 dark:border-slate-600 hover:bg-white"><span className="material-symbols-outlined text-sm">chevron_right</span></button>
          </div>
        </div>
      </div>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={onAddMultiple}
        showToast={showToast as any}
      />
    </div>
  );
};

export default Transactions;
