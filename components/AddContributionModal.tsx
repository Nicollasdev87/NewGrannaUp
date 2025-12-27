import React, { useState } from 'react';

interface AddContributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number, date: string) => void;
    goalTitle: string;
}

const formatCurrencyInput = (val: string) => {
    const numbers = val.replace(/\D/g, '');
    if (!numbers) return '';
    const amount = parseFloat(numbers) / 100;
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
};

const parseCurrencyValue = (val: string) => {
    if (!val) return 0;
    const numbers = val.replace(/\D/g, '');
    return parseFloat(numbers) / 100;
};

const AddContributionModal: React.FC<AddContributionModalProps> = ({ isOpen, onClose, onConfirm, goalTitle }) => {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseCurrencyValue(amount);
        if (numericAmount > 0) {
            onConfirm(numericAmount, date);
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Novo Aporte</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <p className="text-sm text-slate-500 mb-6">Adicionar valor para: <strong className="text-slate-700 dark:text-slate-300">{goalTitle}</strong></p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Valor do Aporte</label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium pt-0.5">R$</span>
                            <input
                                type="text"
                                required
                                autoFocus
                                className="w-full pl-8 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg font-bold"
                                placeholder="0,00"
                                value={amount}
                                onChange={(e) => setAmount(formatCurrencyInput(e.target.value))}
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

                    <div className="pt-2 flex gap-3">
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
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddContributionModal;
