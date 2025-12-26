import React, { useState, useEffect } from 'react';
import { Goal, GoalContribution } from '../types';
import { supabase } from '../services/supabase';

interface GoalContributionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    goal: Goal | null;
    onUpdate: () => void; // Call to refresh goals in App.tsx
}

const GoalContributionsModal: React.FC<GoalContributionsModalProps> = ({ isOpen, onClose, goal, onUpdate }) => {
    const [contributions, setContributions] = useState<GoalContribution[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editAmount, setEditAmount] = useState<string>('');
    const [editDate, setEditDate] = useState<string>('');

    useEffect(() => {
        if (isOpen && goal) {
            fetchContributions();
        }
    }, [isOpen, goal]);

    const fetchContributions = async () => {
        if (!goal) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('goal_contributions')
            .select('*')
            .eq('goal_id', goal.id)
            .order('date', { ascending: false });

        if (data) {
            setContributions(data.map(c => ({
                id: c.id,
                goalId: c.goal_id,
                amount: Number(c.amount),
                date: c.date
            })));
        }
        setLoading(false);
    };

    const handleDelete = async (contribution: GoalContribution) => {
        if (!confirm('Deseja excluir este aporte? O valor será subtraído da meta.')) return;

        const { error } = await supabase
            .from('goal_contributions')
            .delete()
            .eq('id', contribution.id);

        if (error) {
            alert('Erro ao excluir: ' + error.message);
            return;
        }

        // Update goal total
        if (goal) {
            const newTotal = Math.max(0, goal.currentValue - contribution.amount);
            await supabase
                .from('goals')
                .update({ current_value: newTotal })
                .eq('id', goal.id);
        }

        fetchContributions();
        onUpdate();
    };

    const startEdit = (c: GoalContribution) => {
        setEditingId(c.id);
        setEditAmount(c.amount.toString());
        setEditDate(c.date);
    };

    const handleSaveEdit = async (c: GoalContribution) => {
        const newAmount = parseFloat(editAmount);
        if (isNaN(newAmount)) return;

        const { error } = await supabase
            .from('goal_contributions')
            .update({
                amount: newAmount,
                date: editDate
            })
            .eq('id', c.id);

        if (error) {
            alert('Erro ao atualizar: ' + error.message);
            return;
        }

        // Update goal total
        if (goal) {
            const diff = newAmount - c.amount;
            const newTotal = goal.currentValue + diff;
            await supabase
                .from('goals')
                .update({ current_value: newTotal })
                .eq('id', goal.id);
        }

        setEditingId(null);
        fetchContributions();
        onUpdate();
    };

    if (!isOpen || !goal) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Histórico de Aportes</h2>
                        <p className="text-sm text-slate-500">{goal.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="p-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                        </div>
                    ) : contributions.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <span className="material-symbols-outlined text-4xl mb-2 opacity-20">history</span>
                            <p>Nenhum aporte registrado.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {contributions.map((c) => (
                                <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 group">
                                    {editingId === c.id ? (
                                        <div className="flex flex-col gap-2 w-full">
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={editAmount}
                                                    onChange={(e) => setEditAmount(e.target.value)}
                                                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                                <input
                                                    type="date"
                                                    value={editDate}
                                                    onChange={(e) => setEditDate(e.target.value)}
                                                    className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => setEditingId(null)} className="text-xs font-bold text-slate-500 hover:text-slate-700 px-2 py-1">Cancelar</button>
                                                <button onClick={() => handleSaveEdit(c)} className="text-xs font-bold text-primary hover:text-primary-dark px-2 py-1">Salvar</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-[20px]">add</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white">R$ {c.amount.toLocaleString()}</p>
                                                    <p className="text-[11px] text-slate-500">{new Date(c.date).toLocaleDateString('pt-BR')}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-10 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => startEdit(c)} className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                                </button>
                                                <button onClick={() => handleDelete(c)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GoalContributionsModal;
