import React, { useState, useEffect } from 'react';
import { Goal } from '../types';

interface AddGoalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (goal: Omit<Goal, 'id' | 'status'>) => void;
    goalToEdit?: Goal | null;
}

const ICONS = [
    'savings', 'flight_takeoff', 'directions_car', 'home', 'school', 'shield',
    'sports_esports', 'pets', 'shopping_bag', 'payments', 'favorite', 'star',
    'bolt', 'local_dining', 'fitness_center', 'work'
];

const COLORS = [
    { id: 'blue', class: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-blue-500', label: 'Azul' },
    { id: 'emerald', class: 'bg-emerald-500', hover: 'hover:bg-emerald-600', text: 'text-emerald-500', label: 'Verde' },
    { id: 'rose', class: 'bg-rose-500', hover: 'hover:bg-rose-600', text: 'text-rose-500', label: 'Vermelho' },
    { id: 'violet', class: 'bg-violet-500', hover: 'hover:bg-violet-600', text: 'text-violet-500', label: 'Roxo' },
    { id: 'amber', class: 'bg-amber-500', hover: 'hover:bg-amber-600', text: 'text-amber-500', label: 'Laranja' },
    { id: 'pink', class: 'bg-pink-500', hover: 'hover:bg-pink-600', text: 'text-pink-500', label: 'Rosa' },
    { id: 'cyan', class: 'bg-cyan-500', hover: 'hover:bg-cyan-600', text: 'text-cyan-500', label: 'Ciano' },
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

const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose, onSave, goalToEdit }) => {
    const [title, setTitle] = useState('');
    const [initialValue, setInitialValue] = useState('');
    const [targetValue, setTargetValue] = useState('');
    const [deadline, setDeadline] = useState('');
    const [category, setCategory] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('savings');
    const [selectedColor, setSelectedColor] = useState('blue');
    const [selectedBg, setSelectedBg] = useState('');
    const [monthlyContribution, setMonthlyContribution] = useState('');

    useEffect(() => {
        if (goalToEdit) {
            setTitle(goalToEdit.title);
            setInitialValue(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(goalToEdit.currentValue));
            setTargetValue(new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(goalToEdit.targetValue));
            setMonthlyContribution(goalToEdit.monthlyContribution ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(goalToEdit.monthlyContribution) : '');
            setDeadline('');
            setCategory(goalToEdit.category);
            setSelectedIcon(goalToEdit.icon);
            setSelectedColor(goalToEdit.color || 'blue');
            setSelectedBg(goalToEdit.backgroundImage || '');
        } else {
            setTitle('');
            setInitialValue('');
            setTargetValue('');
            setMonthlyContribution('');
            setDeadline('');
            setCategory('');
            setSelectedIcon('savings');
            setSelectedColor('blue');
            setSelectedBg('');
        }
    }, [goalToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const numericInitial = parseCurrencyValue(initialValue);
        const numericTarget = parseCurrencyValue(targetValue);
        const numericMonthly = parseCurrencyValue(monthlyContribution);

        onSave({
            title,
            currentValue: numericInitial,
            targetValue: numericTarget,
            deadline: deadline ? new Date(deadline).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) : (goalToEdit ? goalToEdit.deadline : ''),
            category,
            color: selectedColor,
            icon: selectedIcon,
            backgroundImage: selectedBg,
            monthlyContribution: numericMonthly > 0 ? numericMonthly : undefined,
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] scale-100 animate-in zoom-in-95 duration-200 custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500`}>
                            <span className="material-symbols-outlined">flag</span>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{goalToEdit ? 'Editar Meta' : 'Nova Meta'}</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        {/* Title Row - Full Width */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Título da Meta</label>
                            <input
                                type="text"
                                required
                                maxLength={30}
                                className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg font-medium"
                                placeholder="Ex: Viagem para Europa"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Valor Inicial</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium pt-0.5">R$</span>
                                    <input
                                        type="text"
                                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                                        placeholder="0,00"
                                        value={initialValue}
                                        onChange={(e) => setInitialValue(formatCurrencyInput(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Valor Total</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium pt-0.5">R$</span>
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                                        placeholder="0,00"
                                        value={targetValue}
                                        onChange={(e) => setTargetValue(formatCurrencyInput(e.target.value))}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Mensal Estimado</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium pt-0.5">R$</span>
                                    <input
                                        type="text"
                                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                                        placeholder="0,00"
                                        value={monthlyContribution}
                                        onChange={(e) => setMonthlyContribution(formatCurrencyInput(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Categoria</label>
                                <select
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none font-medium"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="" disabled>Selecione uma categoria</option>
                                    <option value="Viagem">Viagem</option>
                                    <option value="Veículo">Veículo</option>
                                    <option value="Casa">Casa</option>
                                    <option value="Educação">Educação</option>
                                    <option value="Segurança">Segurança</option>
                                    <option value="Lazer">Lazer</option>
                                    <option value="Outros">Outros</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Prazo {goalToEdit && <span className="text-[10px] font-normal lowercase opacity-70">(Atual: {goalToEdit.deadline})</span>}</label>
                                <input
                                    type="date"
                                    required={!goalToEdit}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-1">Escolha uma Cor</label>
                            <div className="flex flex-wrap gap-3">
                                {COLORS.map(color => (
                                    <button
                                        key={color.id}
                                        type="button"
                                        onClick={() => setSelectedColor(color.id)}
                                        className={`w-10 h-10 rounded-full transition-all duration-200 ${color.class} ${color.hover} ${selectedColor === color.id ? 'ring-4 ring-offset-2 ring-slate-200 dark:ring-slate-700 scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'}`}
                                        title={color.label}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-1">Escolha um Ícone</label>
                            <div className="flex flex-wrap gap-2">
                                {ICONS.map(icon => (
                                    <button
                                        key={icon}
                                        type="button"
                                        onClick={() => setSelectedIcon(icon)}
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${selectedIcon === icon ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900 shadow-md scale-110' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                    >
                                        <span className="material-symbols-outlined !text-xl">{icon}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-3 ml-1">Fundo Personalizado</label>
                        <div className="grid grid-cols-4 gap-3">
                            {BACKGROUNDS.map((bg, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setSelectedBg(bg.url)}
                                    className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedBg === bg.url ? 'border-primary ring-2 ring-primary/30' : 'border-transparent hover:border-slate-300'}`}
                                >
                                    {bg.url ? (
                                        <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs text-slate-400 font-medium">
                                            Padrão
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors"></div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 flex gap-3 border-t border-slate-100 dark:border-slate-700 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark transition shadow-lg shadow-primary/30 transform active:scale-[0.98]"
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
