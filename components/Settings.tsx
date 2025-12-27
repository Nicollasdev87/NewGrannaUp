import React, { useState, useEffect } from 'react';
import { Category, CreditCard, Transaction } from '../types';
import { supabase } from '../services/supabase';
import { DEFAULT_CATEGORIES } from '../constants';

interface SettingsProps {
    userId: string;
    showToast: (message: string, type?: 'success' | 'error') => void;
    useCustomCategories: boolean;
    onToggleCategoryMode: (useCustom: boolean) => void;
    transactions: Transaction[];
}

const Settings: React.FC<SettingsProps> = ({ userId, showToast, useCustomCategories, onToggleCategoryMode, transactions }) => {
    const [activeTab, setActiveTab] = useState<'categories' | 'cards'>('categories');
    const [categories, setCategories] = useState<Category[]>([]);
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [loading, setLoading] = useState(true);

    // Form States
    const [isAdding, setIsAdding] = useState(false);
    const [editingItem, setEditingItem] = useState<any | null>(null);

    // Category Form
    const [catName, setCatName] = useState('');
    const [catColor, setCatColor] = useState('#8b5cf6');
    const [catIcon, setCatIcon] = useState('category');
    const [catType, setCatType] = useState<'income' | 'expense'>('expense');

    // Card Form
    const [cardName, setCardName] = useState('');
    const [cardBrand, setCardBrand] = useState('Mastercard');
    const [cardClosingDay, setCardClosingDay] = useState(1);
    const [cardLimit, setCardLimit] = useState('');
    const [cardColor, setCardColor] = useState('#8b5cf6');

    useEffect(() => {
        fetchData();
    }, [userId]);

    const fetchData = async () => {
        setLoading(true);
        const { data: catData } = await supabase.from('categories').select('*').eq('user_id', userId);
        const { data: cardData } = await supabase.from('credit_cards').select('*').eq('user_id', userId);

        if (catData) setCategories(catData.map(c => ({
            ...c, userId: c.user_id
        })));

        if (cardData) setCards(cardData.map(c => ({
            ...c, userId: c.user_id, closingDay: c.closing_day, limit: Number(c.limit)
        })));

        setLoading(false);
    };

    const handleSaveCategory = async () => {
        if (!catName) {
            showToast('Nome é obrigatório', 'error');
            return;
        }

        // Check limits for custom categories
        if (!editingItem) {
            const currentCount = categories.filter(c => c.type === catType).length;
            if (currentCount >= 10) {
                showToast(`Limite de 10 categorias de ${catType === 'income' ? 'receita' : 'despesa'} atingido.`, 'error');
                return;
            }
        }

        const payload = {
            user_id: userId,
            name: catName,
            color: catColor,
            icon: catIcon,
            type: catType
        };

        if (editingItem) {
            const { error } = await supabase.from('categories').update(payload).eq('id', editingItem.id);
            if (error) showToast('Erro ao atualizar categoria', 'error');
            else {
                showToast('Categoria atualizada!');
                fetchData();
                resetForm();
            }
        } else {
            const { error } = await supabase.from('categories').insert([payload]);
            if (error) showToast('Erro ao criar categoria', 'error');
            else {
                showToast('Categoria criada!');
                fetchData();
                resetForm();
            }
        }
    };

    const handleSaveCard = async () => {
        if (!cardName) {
            showToast('Nome é obrigatório', 'error');
            return;
        }

        const payload = {
            user_id: userId,
            name: cardName,
            brand: cardBrand,
            closing_day: cardClosingDay,
            limit: Number(cardLimit),
            color: cardColor
        };

        if (editingItem) {
            const { error } = await supabase.from('credit_cards').update(payload).eq('id', editingItem.id);
            if (error) {
                console.error('Supabase Update Error:', error);
                showToast('Erro ao atualizar cartão', 'error');
            }
            else {
                showToast('Cartão atualizado!');
                fetchData();
                resetForm();
            }
        } else {
            const { error } = await supabase.from('credit_cards').insert([payload]);
            if (error) {
                console.error('Supabase Error:', error);
                showToast('Erro ao criar cartão', 'error');
            }
            else {
                showToast('Cartão criado!');
                fetchData();
                resetForm();
            }
        }
    };

    const handleDelete = async (id: string, table: 'categories' | 'credit_cards') => {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) showToast('Erro ao excluir item', 'error');
        else {
            showToast('Item excluído!');
            fetchData();
        }
    };

    const resetForm = () => {
        setIsAdding(false);
        setEditingItem(null);
        setCatName('');
        setCatColor('#8b5cf6');
        setCatIcon('category');
        setCatType('expense');
        setCardName('');
        setCardBrand('Mastercard');
        setCardClosingDay(1);
        setCardLimit('');
        setCardColor('#8b5cf6');
    };

    const openEdit = (item: any, type: 'category' | 'card') => {
        setEditingItem(item);
        setIsAdding(true);
        if (type === 'category') {
            setCatName(item.name);
            setCatColor(item.color);
            setCatIcon(item.icon);
            setCatType(item.type);
        } else {
            setCardName(item.name);
            setCardBrand(item.brand);
            setCardClosingDay(item.closingDay);
            setCardLimit(item.limit.toString());
            setCardColor(item.color);
        }
    };

    const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e', '#64748b'];
    const ICONS = ['shopping_bag', 'home', 'directions_car', 'restaurant', 'movie', 'flight', 'school', 'medication', 'pets', 'savings', 'paid', 'work', 'fitness_center', 'sports_esports'];

    const getBankLogo = (cardName: string) => {
        const name = cardName.toLowerCase();
        if (name.includes('nubank')) return 'https://logo.clearbit.com/nubank.com.br';
        if (name.includes('itau') || name.includes('itaú')) return 'https://logo.clearbit.com/itau.com.br';
        if (name.includes('bradesco')) return 'https://logo.clearbit.com/bradesco.com.br';
        if (name.includes('santander')) return 'https://logo.clearbit.com/santander.com.br';
        if (name.includes('inter')) return 'https://logo.clearbit.com/bancointer.com.br';
        if (name.includes('c6')) return 'https://logo.clearbit.com/c6bank.com.br';
        if (name.includes('xp')) return 'https://logo.clearbit.com/xpi.com.br';
        if (name.includes('btg')) return 'https://logo.clearbit.com/btgpactual.com';
        if (name.includes('caixa')) return 'https://logo.clearbit.com/caixa.gov.br';
        if (name.includes('brasil') || name.includes('bb')) return 'https://logo.clearbit.com/bb.com.br';
        if (name.includes('safra')) return 'https://logo.clearbit.com/safra.com.br';
        if (name.includes('sicoob')) return 'https://logo.clearbit.com/sicoob.com.br';
        if (name.includes('sicredi')) return 'https://logo.clearbit.com/sicredi.com.br';
        return null;
    };

    const getBrandLogo = (brand: string) => {
        switch (brand.toLowerCase()) {
            case 'visa': return 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg';
            case 'mastercard': return 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg';
            case 'elo': return 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Elo_brand_logo.svg';
            case 'amex': return 'https://upload.wikimedia.org/wikipedia/commons/3/30/American_Express_logo.svg'; // American Express
            case 'hipercard': return 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Hipercard_logo.svg';
            default: return null;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex justify-between items-center mt-6">
                <div>
                    <h2 className="text-2xl font-bold text-primary dark:text-white">Configurações</h2>
                    <p className="text-sm text-slate-500">Gerencie suas preferências</p>
                </div>
            </div>

            {/* Toggle Category Mode */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-white">Modo de Categorias</h3>
                    <p className="text-sm text-slate-500">Escolha entre usar categorias padrão ou personalizar as suas.</p>
                </div>
                <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                    <button
                        onClick={() => onToggleCategoryMode(false)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${!useCustomCategories ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        Padrão
                    </button>
                    <button
                        onClick={() => onToggleCategoryMode(true)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${useCustomCategories ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        Personalizadas
                    </button>
                </div>
            </div>

            {/* Tabs & Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-0">
                <div className="flex gap-4">
                    <button
                        onClick={() => { setActiveTab('categories'); resetForm(); }}
                        className={`pb-3 text-sm font-medium transition-all ${activeTab === 'categories' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        Categorias
                    </button>
                    <button
                        onClick={() => { setActiveTab('cards'); resetForm(); }}
                        className={`pb-3 text-sm font-medium transition-all ${activeTab === 'cards' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        Meus Cartões
                    </button>
                </div>

                {!isAdding && (
                    <div className="flex items-center gap-4 mb-2 md:mb-0">
                        {activeTab === 'categories' && useCustomCategories && (
                            <div className="flex gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                                <span className={categories.filter(c => c.type === 'income').length >= 10 ? 'text-red-500' : ''}>
                                    Receitas: {categories.filter(c => c.type === 'income').length}/10
                                </span>
                                <span className="w-px h-4 bg-slate-200 dark:bg-slate-700"></span>
                                <span className={categories.filter(c => c.type === 'expense').length >= 10 ? 'text-red-500' : ''}>
                                    Despesas: {categories.filter(c => c.type === 'expense').length}/10
                                </span>
                            </div>
                        )}
                        <button
                            onClick={() => setIsAdding(true)}
                            className={`flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-bold shadow-md shadow-primary/20 ${(!useCustomCategories && activeTab === 'categories') ? 'hidden' : ''}`}
                        >
                            <span className="material-symbols-outlined !text-lg">add</span>
                            {activeTab === 'categories' ? 'Nova Categoria' : 'Novo Cartão'}
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 min-h-[400px]">



                {/* Adding/Editing Modal */}
                {isAdding && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh] scale-100 animate-in zoom-in-95 duration-200 custom-scrollbar">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                                    {editingItem ? 'Editar' : 'Adicionar'} {activeTab === 'categories' ? 'Categoria' : 'Cartão'}
                                </h3>
                                <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {activeTab === 'categories' ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome</label>
                                            <input
                                                type="text"
                                                value={catName}
                                                onChange={e => setCatName(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-slate-900 dark:text-white"
                                                placeholder="Ex: Alimentação"
                                                autoFocus
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex justify-between">
                                                <span>Tipo</span>
                                                {(() => {
                                                    const count = categories.filter(c => c.type === catType).length;
                                                    const isFull = count >= 10;
                                                    return (
                                                        <span className={`text-xs font-bold ${isFull ? 'text-red-500' : 'text-slate-400'}`}>
                                                            {count}/10
                                                        </span>
                                                    );
                                                })()}
                                            </label>
                                            <select
                                                value={catType}
                                                onChange={e => setCatType(e.target.value as any)}
                                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                                            >
                                                <option value="expense">Despesa</option>
                                                <option value="income">Receita</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cor</label>
                                            <div className="flex flex-wrap gap-2">
                                                {COLORS.map(c => (
                                                    <button
                                                        key={c}
                                                        onClick={() => setCatColor(c)}
                                                        className={`w-8 h-8 rounded-full transition-all ${catColor === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ícone</label>
                                            <div className="flex flex-wrap gap-2 h-32 overflow-y-auto pr-2 custom-scrollbar">
                                                {ICONS.map(icon => (
                                                    <button
                                                        key={icon}
                                                        onClick={() => setCatIcon(icon)}
                                                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${catIcon === icon ? 'bg-primary text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                                    >
                                                        <span className="material-symbols-outlined">{icon}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome do Cartão</label>
                                            <input
                                                type="text"
                                                value={cardName}
                                                onChange={e => setCardName(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-slate-900 dark:text-white"
                                                placeholder="Ex: Nubank Principal"
                                                autoFocus
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Bandeira</label>
                                            <select
                                                value={cardBrand}
                                                onChange={e => setCardBrand(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary/50 text-slate-900 dark:text-white"
                                            >
                                                <option value="Mastercard">Mastercard</option>
                                                <option value="Visa">Visa</option>
                                                <option value="Elo">Elo</option>
                                                <option value="Amex">American Express</option>
                                                <option value="Hipercard">Hipercard</option>
                                                <option value="Outro">Outro</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dia de Vencimento</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="31"
                                                value={cardClosingDay}
                                                onChange={e => setCardClosingDay(Number(e.target.value))}
                                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-slate-900 dark:text-white"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Limite (R$)</label>
                                            <input
                                                type="number"
                                                value={cardLimit}
                                                onChange={e => setCardLimit(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary/50 transition-all text-slate-900 dark:text-white"
                                                placeholder="0,00"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cor do Cartão</label>
                                            <div className="flex flex-wrap gap-2">
                                                {COLORS.map(c => (
                                                    <button
                                                        key={c}
                                                        onClick={() => setCardColor(c)}
                                                        className={`w-8 h-8 rounded-full transition-all ${cardColor === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                                                        style={{ backgroundColor: c }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    onClick={resetForm}
                                    className="px-4 py-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-bold transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={activeTab === 'categories' ? handleSaveCategory : handleSaveCard}
                                    disabled={activeTab === 'categories' && !editingItem && categories.filter(c => c.type === catType).length >= 10}
                                    className={`px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition shadow-lg shadow-primary/30 font-bold ${activeTab === 'categories' && !editingItem && categories.filter(c => c.type === catType).length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    Salvar {activeTab === 'categories' ? 'Categoria' : 'Cartão'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* List */}
                {loading ? (
                    <div className="text-center py-10 text-slate-400">Carregando...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {activeTab === 'categories' ? (
                            !useCustomCategories ? (
                                DEFAULT_CATEGORIES.map(cat => (
                                    <div key={cat.id} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl flex items-center justify-between group border border-transparent hover:border-slate-200 dark:hover:border-slate-700 opacity-80 hover:opacity-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: cat.color }}>
                                                <span className="material-symbols-outlined">{cat.icon}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-white">{cat.name}</h4>
                                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${cat.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {cat.type === 'income' ? 'Receita' : 'Despesa'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                            Padrão
                                        </div>
                                    </div>
                                ))
                            ) : (
                                categories.length > 0 ? categories.map(cat => (
                                    <div key={cat.id} className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl flex items-center justify-between group hover:shadow-md transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: cat.color }}>
                                                <span className="material-symbols-outlined">{cat.icon}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 dark:text-white">{cat.name}</h4>
                                                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${cat.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {cat.type === 'income' ? 'Receita' : 'Despesa'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(cat, 'category')} className="p-2 text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all">
                                                <span className="material-symbols-outlined text-[18px]">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(cat.id, 'categories')} className="p-2 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all">
                                                <span className="material-symbols-outlined text-[18px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-full text-center py-10 text-slate-400 flex flex-col items-center">
                                        <span className="material-symbols-outlined text-4xl mb-2 opacity-30">category</span>
                                        <p>Nenhuma categoria personalizada encontrada.</p>
                                    </div>
                                )
                            )
                        ) : (
                            cards.length > 0 ? cards.map(card => {
                                const bankLogo = getBankLogo(card.name);
                                const brandLogo = getBrandLogo(card.brand);

                                return (
                                    <div key={card.id} className="bg-slate-50 dark:bg-slate-900 rounded-xl relative overflow-hidden group hover:shadow-lg transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700" style={{ minHeight: '200px' }}>
                                        {/* Thin colored bar at top */}
                                        <div className="h-1.5 w-full" style={{ backgroundColor: card.color }} />

                                        {/* Gradient pattern background */}
                                        <div className="absolute inset-0 pointer-events-none z-0"
                                            style={{
                                                background: `linear-gradient(135deg, ${card.color}15 0%, transparent 50%, ${card.color}10 100%)`
                                            }}
                                        />

                                        <div className="p-4 relative z-10 flex flex-col h-full" style={{ minHeight: '185px' }}>
                                            {/* Top row: Bank logo left, Brand logo right */}
                                            <div className="flex justify-between items-start">
                                                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center p-1.5 shadow-sm">
                                                    {bankLogo ? (
                                                        <img src={bankLogo} alt={card.name} className="w-full h-full object-contain" />
                                                    ) : (
                                                        <span className="material-symbols-outlined text-slate-400 !text-xl">credit_card</span>
                                                    )}
                                                </div>
                                                {brandLogo && (
                                                    <img src={brandLogo} alt={card.brand} className="h-6 object-contain opacity-60" />
                                                )}
                                            </div>

                                            {/* Center: Card Name */}
                                            <div className="flex-1 flex flex-col justify-center items-center my-3">
                                                <h4 className="text-xl font-bold text-slate-800 dark:text-white text-center">{card.name}</h4>
                                                <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium mt-1.5">
                                                    Vence dia {card.closingDay}
                                                </span>
                                            </div>

                                            {/* Bottom: Limit info and progress bar */}
                                            {(() => {
                                                const totalSpend = transactions
                                                    .filter(t => t.paymentMethod === 'Cartão de Crédito' && t.cardBrand === card.name)
                                                    .reduce((sum, t) => sum + t.value, 0);

                                                const totalPayments = transactions
                                                    .filter(t => t.isBillPayment && t.billCardBrand === card.name)
                                                    .reduce((sum, t) => sum + t.value, 0);

                                                const currentDebt = Math.max(0, totalSpend - totalPayments);
                                                const availableLimit = Math.max(0, card.limit - currentDebt);
                                                const usagePercent = Math.min(100, (currentDebt / card.limit) * 100);

                                                return (
                                                    <div className="mt-auto space-y-2">
                                                        <div className="flex justify-between items-end">
                                                            <div>
                                                                <p className="text-[10px] text-slate-400 uppercase tracking-wide">Limite Disponível</p>
                                                                <p className="text-lg font-bold text-slate-800 dark:text-white">
                                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(availableLimit)}
                                                                </p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="text-[10px] text-slate-400">de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(card.limit)}</p>
                                                                <p className="text-xs font-bold" style={{ color: card.color }}>{Math.round(100 - usagePercent)}%</p>
                                                            </div>
                                                        </div>
                                                        <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full rounded-full transition-all duration-500"
                                                                style={{
                                                                    width: `${100 - usagePercent}%`,
                                                                    backgroundColor: card.color
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        {/* Edit/Delete buttons */}
                                        <div className="absolute top-3 right-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                            <button onClick={() => openEdit(card, 'card')} className="p-1.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-primary rounded-full shadow-sm">
                                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                            </button>
                                            <button onClick={() => handleDelete(card.id, 'credit_cards')} className="p-1.5 bg-white dark:bg-slate-800 text-slate-400 hover:text-red-500 rounded-full shadow-sm">
                                                <span className="material-symbols-outlined text-[16px]">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="col-span-full text-center py-10 text-slate-400 flex flex-col items-center">
                                    <span className="material-symbols-outlined text-4xl mb-2 opacity-30">credit_card</span>
                                    <p>Nenhum cartão cadastrado.</p>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
export default Settings;
