import React, { useState, useEffect } from 'react';
import { Investment } from '../types';

interface AddInvestmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (investment: Omit<Investment, 'id'>) => void;
    investmentToEdit?: Investment | null;
}

const AddInvestmentModal: React.FC<AddInvestmentModalProps> = ({ isOpen, onClose, onSave, investmentToEdit }) => {
    const [formData, setFormData] = useState({
        name: '',
        ticker: '',
        category: 'Ações',
        quantity: 0,
        purchasePrice: 0,
        currentPrice: 0,
        color: '#8c2bee',
        icon: 'trending_up',
    });

    // Track which fields are focused (to show raw number vs formatted)
    const [focusedField, setFocusedField] = useState<string | null>(null);

    // Display values for formatted fields
    const [displayValues, setDisplayValues] = useState({
        purchasePrice: '',
        currentPrice: '',
        quantity: '',
    });

    useEffect(() => {
        if (investmentToEdit) {
            setFormData({
                name: investmentToEdit.name,
                ticker: investmentToEdit.ticker || '',
                category: investmentToEdit.category,
                quantity: investmentToEdit.quantity,
                purchasePrice: investmentToEdit.purchasePrice,
                currentPrice: investmentToEdit.currentPrice,
                color: investmentToEdit.color,
                icon: investmentToEdit.icon,
            });
            setDisplayValues({
                purchasePrice: formatCurrency(investmentToEdit.purchasePrice),
                currentPrice: formatCurrency(investmentToEdit.currentPrice),
                quantity: investmentToEdit.quantity.toString(),
            });
        } else {
            setFormData({
                name: '',
                ticker: '',
                category: 'Ações',
                quantity: 0,
                purchasePrice: 0,
                currentPrice: 0,
                color: '#8c2bee',
                icon: 'trending_up',
            });
            setDisplayValues({
                purchasePrice: '',
                currentPrice: '',
                quantity: '',
            });
        }
    }, [investmentToEdit, isOpen]);

    // Format number to Brazilian currency
    const formatCurrency = (value: number): string => {
        if (value === 0) return '';
        return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Parse Brazilian currency string to number
    const parseCurrency = (value: string): number => {
        // Remove R$, spaces, and replace comma with dot
        const cleaned = value.replace(/R\$\s?/g, '').replace(/\./g, '').replace(',', '.');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    };

    // Handle focus on currency field
    const handleCurrencyFocus = (field: 'purchasePrice' | 'currentPrice') => {
        setFocusedField(field);
        // Show raw number when focused
        if (formData[field] > 0) {
            setDisplayValues(prev => ({
                ...prev,
                [field]: formData[field].toString().replace('.', ','),
            }));
        }
    };

    // Handle blur on currency field
    const handleCurrencyBlur = (field: 'purchasePrice' | 'currentPrice') => {
        setFocusedField(null);
        // Format to currency when blur
        const value = formData[field];
        setDisplayValues(prev => ({
            ...prev,
            [field]: formatCurrency(value),
        }));
    };

    // Handle change on currency field
    const handleCurrencyChange = (field: 'purchasePrice' | 'currentPrice', value: string) => {
        // Allow only numbers, dots and commas
        const cleaned = value.replace(/[^\d,]/g, '');
        setDisplayValues(prev => ({ ...prev, [field]: cleaned }));

        // Parse and update formData
        const numValue = parseFloat(cleaned.replace(',', '.')) || 0;
        setFormData(prev => ({ ...prev, [field]: numValue }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const totalValue = formData.currentPrice * formData.quantity;
        const percentage = formData.purchasePrice > 0
            ? ((totalValue / (formData.purchasePrice * formData.quantity)) - 1) * 100
            : 0;

        onSave({
            ...formData,
            totalValue,
            percentage,
        });

        onClose();
    };

    const categories = ['Ações', 'Cripto', 'Fundos Imobiliários', 'Internacional', 'Renda Fixa'];
    const categoryColors: { [key: string]: string } = {
        'Ações': '#ec4899',
        'Cripto': '#f59e0b',
        'Fundos Imobiliários': '#0ea5e9',
        'Internacional': '#000000',
        'Renda Fixa': '#22c55e',
    };

    const handleCategoryChange = (category: string) => {
        setFormData({
            ...formData,
            category,
            color: categoryColors[category] || '#8c2bee',
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {investmentToEdit ? 'Editar Investimento' : 'Adicionar Investimento'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Name and Ticker */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Nome do Ativo *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Ex: Bitcoin, ITUB4, MXRF11"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Ticker (Opcional)
                            </label>
                            <input
                                type="text"
                                value={formData.ticker}
                                onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="Ex: BTC, ITUB4"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Categoria *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => handleCategoryChange(category)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.category === category
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity and Prices */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Quantidade *
                            </label>
                            <input
                                type="number"
                                required
                                min="0"
                                step="0.001"
                                value={formData.quantity || ''}
                                onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="0"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Preço Médio (R$) *
                            </label>
                            <input
                                type="text"
                                required
                                value={displayValues.purchasePrice}
                                onChange={(e) => handleCurrencyChange('purchasePrice', e.target.value)}
                                onFocus={() => handleCurrencyFocus('purchasePrice')}
                                onBlur={() => handleCurrencyBlur('purchasePrice')}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="R$ 0,00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Preço Atual (R$) *
                            </label>
                            <input
                                type="text"
                                required
                                value={displayValues.currentPrice}
                                onChange={(e) => handleCurrencyChange('currentPrice', e.target.value)}
                                onFocus={() => handleCurrencyFocus('currentPrice')}
                                onBlur={() => handleCurrencyBlur('currentPrice')}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                                placeholder="R$ 0,00"
                            />
                        </div>
                    </div>

                    {/* Summary */}
                    {formData.quantity > 0 && formData.currentPrice > 0 && (
                        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Valor Total</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                R$ {(formData.currentPrice * formData.quantity).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary-dark transition-colors shadow-md"
                        >
                            {investmentToEdit ? 'Salvar Alterações' : 'Adicionar Investimento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddInvestmentModal;
