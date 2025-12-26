
import React, { useState } from 'react';
import { Transaction } from '../types';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id'>) => void;
    transactionToEdit?: Transaction | null;
}


const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onSave, transactionToEdit }) => {

    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [installments, setInstallments] = useState('');

    const formatCurrencyInput = (val: string) => {
        const numbers = val.replace(/\D/g, '');
        if (!numbers) return '';
        const amount = parseFloat(numbers) / 100;
        return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDateForDisplay = (dateStr: string) => {
        if (!dateStr) return '';
        const [year, month, day] = dateStr.split('-');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
        return `${day} ${monthNames[dateObj.getMonth()]}`;
    };

    React.useEffect(() => {
        if (transactionToEdit) {
            setType(transactionToEdit.type);
            setDescription(transactionToEdit.description);
            // Convert stored number back to "1.234,56" format for input
            const formattedValue = new Intl.NumberFormat('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(transactionToEdit.value);
            setValue(formattedValue);
            setCategory(transactionToEdit.category);
            setDate(transactionToEdit.date);
            setPaymentMethod(transactionToEdit.paymentMethod || '');
            setInstallments(transactionToEdit.installments || '');
        } else {
            setType('expense');
            setDescription('');
            setValue('');
            setCategory('');
            setDate(new Date().toISOString().split('T')[0]);
            setPaymentMethod('');
            setInstallments('');
        }
    }, [transactionToEdit, isOpen]);



    if (!isOpen) return null;


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Convert "1.234,56" back to number
        const numericValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));

        onSave({
            type,
            description,
            value: numericValue,
            category,
            date,
            icon: type === 'income' ? 'payments' : 'shopping_bag',
            paymentMethod,
            installments: type === 'expense' ? installments : undefined,
        });



        // Reset form
        setDescription('');
        setValue('');
        setCategory('');
        setDate('');
        setPaymentMethod('');
        setInstallments('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {transactionToEdit ? 'Editar Lançamento' : 'Novo Lançamento'}
                    </h2>

                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setType('income')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all ${type === 'income' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                        >
                            <span className="material-symbols-outlined !text-lg">arrow_upward</span>
                            Receita
                        </button>
                        <button
                            type="button"
                            onClick={() => setType('expense')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all ${type === 'expense' ? 'bg-red-100 text-red-700 shadow-sm' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                        >
                            <span className="material-symbols-outlined !text-lg">arrow_downward</span>
                            Despesa
                        </button>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Descrição</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            placeholder="Ex: Supermercado"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Valor</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-slate-400 text-sm">R$</span>
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="0,00"
                                    value={value}
                                    onChange={(e) => setValue(formatCurrencyInput(e.target.value))}
                                />

                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Data</label>
                            <input
                                type="date"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Categoria</label>
                            <select
                                required
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="" disabled>Selecione</option>
                                <option value="Alimentação">Alimentação</option>
                                <option value="Trabalho">Trabalho</option>
                                <option value="Transporte">Transporte</option>
                                <option value="Lazer">Lazer</option>
                                <option value="Saúde">Saúde</option>
                                <option value="Educação">Educação</option>
                                <option value="Renda Extra">Renda Extra</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Pagamento</label>
                            <select
                                required
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                            >
                                <option value="" disabled>Selecione</option>
                                <option value="Pix">Pix</option>
                                <option value="Cartão de Crédito">Cartão de Crédito</option>
                                <option value="Cartão de Débito">Cartão de Débito</option>
                                <option value="Dinheiro">Dinheiro</option>
                                <option value="Nubank">Nubank</option>
                                <option value="Santander">Santander</option>
                                <option value="Itaú">Itaú</option>
                            </select>
                        </div>
                    </div>

                    {type === 'expense' && (
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Parcelas / À vista</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={installments}
                                onChange={(e) => setInstallments(e.target.value)}
                            >
                                <option value="À vista">À vista</option>
                                <option value="2x">2x</option>
                                <option value="3x">3x</option>
                                <option value="4x">4x</option>
                                <option value="5x">5x</option>
                                <option value="6x">6x</option>
                                <option value="10x">10x</option>
                                <option value="12x">12x</option>
                            </select>
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition shadow-lg shadow-primary/30"
                        >
                            Salvar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionModal;
