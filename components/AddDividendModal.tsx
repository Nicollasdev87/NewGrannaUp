import React, { useState } from 'react';

interface Dividend {
    id: string;
    assetName: string;
    value: number;
    date: string;
}

interface AddDividendModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (dividend: Omit<Dividend, 'id'>) => void;
    investments: Array<{ id: string; name: string }>;
}

const AddDividendModal: React.FC<AddDividendModalProps> = ({ isOpen, onClose, onSave, investments }) => {
    const [formData, setFormData] = useState({
        assetName: '',
        value: 0,
        date: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        setFormData({
            assetName: '',
            value: 0,
            date: new Date().toISOString().split('T')[0],
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full">
                <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Adicionar Dividendo
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Asset Selection */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Ativo *
                        </label>
                        <select
                            required
                            value={formData.assetName}
                            onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        >
                            <option value="">Selecione um ativo</option>
                            {investments.map((inv) => (
                                <option key={inv.id} value={inv.name}>
                                    {inv.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Data do Pagamento *
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>

                    {/* Value */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Valor Recebido (R$) *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={formData.value}
                            onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="0,00"
                        />
                    </div>

                    {/* Summary */}
                    {formData.value > 0 && formData.assetName && (
                        <div className="bg-primary/10 rounded-lg p-4">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Resumo</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                {formData.assetName} pagou R$ {formData.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                            Adicionar Dividendo
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddDividendModal;
