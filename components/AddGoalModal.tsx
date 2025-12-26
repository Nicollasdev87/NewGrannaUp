import React, { useState, useEffect } from 'react';
import { Goal } from '../types';

interface AddGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: Omit<Goal, 'id' | 'currentValue' | 'status'>) => void;
    goalToEdit?: Goal | null;
}

const ICONS = [
    'savings', 'flight_takeoff', 'directions_car', 'home', 'school', 'shield',
    'sports_esports', 'pets', 'shopping_bag', 'payments', 'favorite', 'star',
    'bolt', 'local_dining', 'fitness_center', 'work'
];

const BACKGROUNDS = [
    { name: 'Minimalist', url: '' }, // No background
    { name: 'Montanha', url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=300&h=150' },
    { name: 'Praia', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=300&h=150' },
    { name: 'Cidade', url: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&q=80&w=300&h=150' },
    { name: 'Tecnologia', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=300&h=150' },
    { name: 'Natureza', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=300&h=150' },
    { name: 'Abstrato', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&q=80&w=300&h=150' },
    { name: 'Moedas', url: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&q=80&w=300&h=150' },
];

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

const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, onSave, goalToEdit }) => {
    const [title, setTitle] = useState('');
    const [targetValue, setTargetValue] = useState('');
    const [deadline, setDeadline] = useState('');
    const [category, setCategory] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('savings');
    const [selectedBg, setSelectedBg] = useState('');
    const [monthlyContribution, setMonthlyContribution] = useState('');

    useEffect(() => {
        if (goalToEdit) {
            setTitle(goalToEdit.title);
            setTargetValue(formatCurrency(goalToEdit.targetValue));
            setMonthlyContribution(goalToEdit.monthlyContribution ? formatCurrency(goalToEdit.monthlyContribution) : '');
            setDeadline('');
            setCategory(goalToEdit.category);
            setSelectedIcon(goalToEdit.icon);
            setSelectedBg(goalToEdit.backgroundImage || '');
        } else {
            setTitle('');
            setTargetValue('');
            setMonthlyContribution('');
            setDeadline('');
            setCategory('');
            setSelectedIcon('savings');
            setSelectedBg('');
        }
    }, [goalToEdit, isOpen]);

    if (!isOpen) return null;

    const handleValueBlur = () => {
        const formatted = formatCurrency(targetValue);
        setTargetValue(formatted);
    };

    const handleMonthlyContributionBlur = () => {
        const formatted = formatCurrency(monthlyContribution);
        setMonthlyContribution(formatted);
    };

    const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTargetValue(e.target.value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const numericValue = parseCurrencyToNumber(targetValue);
        const numericMonthly = parseCurrencyToNumber(monthlyContribution);

        onSave({
            title,
            targetValue: numericValue,
            deadline: deadline ? new Date(deadline).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : (goalToEdit ? goalToEdit.deadline : ''),
            category,
            icon: selectedIcon,
            backgroundImage: selectedBg,
            monthlyContribution: numericMonthly > 0 ? numericMonthly : undefined,
        });

        setTitle('');
        setTargetValue('');
        setMonthlyContribution('');
        setDeadline('');
        setCategory('');
        setSelectedIcon('savings');
        setSelectedBg('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh] scale-100 animate-in zoom-in-95 duration-200 custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 text-purple-600 p-2 rounded-lg">
                            <span className="material-symbols-outlined">flag</span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{goalToEdit ? 'Editar Meta' : 'Nova Meta'}</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Título</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                placeholder="Ex: Viagem"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">MENSAL ESTIMADO</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="R$ 0,00"
                                    value={monthlyContribution}
                                    onChange={(e) => setMonthlyContribution(e.target.value)}
                                    onBlur={handleMonthlyContributionBlur}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Valor Total</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder="R$ 0,00"
                                    value={targetValue}
                                    onChange={handleValueChange}
                                    onBlur={handleValueBlur}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Categoria</label>
                            <select
                                required
                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="" disabled>Selecione</option>
                                <option value="Viagem">Viagem</option>
                                <option value="Veículo">Veículo</option>
                                <option value="Casa">Casa</option>
                                <option value="Educação">Educação</option>
                                <option value="Segurança">Segurança</option>
                                <option value="Lazer">Lazer</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Prazo {goalToEdit && <span className="text-[10px] font-normal lowercase">(Atual: {goalToEdit.deadline})</span>}</label>
                        <input
                            type="date"
                            required={!goalToEdit}
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Escolha um Ícone</label>
                        <div className="grid grid-cols-8 gap-2">
                            {ICONS.map(icon => (
                                <button
                                    key={icon}
                                    type="button"
                                    onClick={() => setSelectedIcon(icon)}
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${selectedIcon === icon ? 'bg-primary text-white shadow-lg scale-110' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                >
                                    <span className="material-symbols-outlined !text-xl">{icon}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Fundo Personalizado</label>
                        <div className="grid grid-cols-4 gap-3">
                            {BACKGROUNDS.map((bg, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedBg(bg.url)}
                                    className={`relative h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedBg === bg.url ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-slate-300'}`}
                                >
                                    {bg.url ? (
                                        <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                                            Padrão
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors"></div>
                                </button>
                            ))}
                        </div>
                    </div>

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
                            {goalToEdit ? 'Salvar Alterações' : 'Criar Meta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddGoalModal;
