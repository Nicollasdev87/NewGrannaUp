import React, { useState } from 'react';

interface AddContributionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (amount: number, date: string) => void;
    goalTitle: string;
}

const formatCurrency = (value: string | number): string => {
    if (!value) return '';
    const numericString = String(value).replace(/[^0-9,.]/g, '').replace(',', '.');
    const parsed = parseFloat(numericString);
    if (isNaN(parsed)) return '';
    return parsed.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const parseCurrencyToNumber = (value: string): number => {
    if (!value) return 0;
    const clean = value.replace(/[^0-9,.-]/g, '');
    const lastComma = clean.lastIndexOf(',');
    const lastDot = clean.lastIndexOf('.');
    let normalized = clean;
    if (lastComma > lastDot) {
        normalized = clean.replace(/\./g, '').replace(',', '.');
    } else if (lastDot > lastComma) {
        normalized = clean.replace(/,/g, '');
    }
    return parseFloat(normalized) || 0;
};

const AddContributionModal: React.FC<AddContributionModalProps> = ({ isOpen, onClose, onConfirm, goalTitle }) => {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today

    if (!isOpen) return null;

    const handleValueBlur = () => {
        const formatted = formatCurrency(amount);
        setAmount(formatted);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericAmount = parseCurrencyToNumber(amount);
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
                            <input
                                type="text"
                                required
                                autoFocus
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg font-bold"
                                placeholder="R$ 0,00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                onBlur={handleValueBlur}
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
