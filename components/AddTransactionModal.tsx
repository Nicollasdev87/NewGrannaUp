
import React, { useState } from 'react';
import { Transaction, Category, CreditCard } from '../types';

interface AddTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: Omit<Transaction, 'id'>) => void;
    onSaveInvestment?: (investment: any, date: string) => void; // Added prop
    transactionToEdit?: Transaction | null;
    categories: Category[];
    creditCards: CreditCard[];
}


const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onSave, onSaveInvestment, transactionToEdit, categories, creditCards }) => {

    const [type, setType] = useState<'income' | 'expense' | 'investment'>('expense');
    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');

    // Investment specific state
    const [ticker, setTicker] = useState('');
    const [quantity, setQuantity] = useState('');

    const [cardBrand, setCardBrand] = useState('');
    const [isInstallment, setIsInstallment] = useState(false);
    const [installmentCount, setInstallmentCount] = useState(1);
    const [isBillPayment, setIsBillPayment] = useState(false);
    const [billCardBrand, setBillCardBrand] = useState('');

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

    // Auto-calculate total for investments
    React.useEffect(() => {
        if (type === 'investment' && quantity && value) {
            // value in modal is treated as Unit Price for investment
            // But 'value' state stores the formatted string "1.234,56"
            // So we might need a separate state for unit price OR reuse 'value' as unit price
            // The user request implies "Total Value" is calculated.
            // Let's use 'value' as Unit Price for investment mode?
            // Or 'value' as Total?
            // Usually: Qty * Unit Price = Total.
            // The modal field "Valor Total" (value) exists.
            // Maybe add Unit Price field and disable Total Value field (make it calculated)?
            // Or allow user to input Total + Qty, and calc Unit Price?
            // Standard approach: Input Qty and Unit Price.
        }
    }, [quantity, value, type]);

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
            setCardBrand(transactionToEdit.cardBrand || '');
            setIsBillPayment(transactionToEdit.isBillPayment || false);
            setBillCardBrand(transactionToEdit.billCardBrand || '');

            if (transactionToEdit.totalInstallments && transactionToEdit.totalInstallments > 1) {
                setIsInstallment(true);
                setInstallmentCount(transactionToEdit.totalInstallments);
            } else {
                setIsInstallment(false);
                setInstallmentCount(1);
            }
            // Reset investment specific fields when editing a non-investment transaction
            setTicker('');
            setQuantity('');
        } else {
            // Default reset
            // Keep current type if switching types? No, reset defaults.
            // We handle reset in onClose normally
            setType('expense'); // Default to expense when opening fresh
            setDescription('');
            setValue('');
            setCategory('');
            setDate(new Date().toISOString().split('T')[0]); // Set current date
            setPaymentMethod('');
            setCardBrand('');
            setIsInstallment(false);
            setInstallmentCount(1);
            setIsBillPayment(false);
            setBillCardBrand('');
            setTicker('');
            setQuantity('');
        }
    }, [transactionToEdit, isOpen]);



    if (!isOpen) return null;


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const numericValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));

        if (type === 'investment' && onSaveInvestment) {
            const qty = parseFloat(quantity);
            const unitPrice = numericValue; // Treating the main "Value" input as Unit Price
            const total = qty * unitPrice;

            // Construct Investment Object
            const investmentObj = {
                name: ticker, // Use ticker as name initially
                ticker: ticker,
                category: category || 'Ações', // Default or selected
                quantity: qty,
                purchasePrice: unitPrice,
                currentPrice: unitPrice, // Assuming bought at current
                totalValue: total,
                percentage: 0, // Recalculated later
                color: '#82ca9d', // Default color, logic handled in App ideally
                icon: 'show_chart'
            };

            onSaveInvestment(investmentObj, date);
        } else {
            const selectedCategory = categories.find(cat => cat.name === category && cat.type === type);

            onSave({
                date,
                description,
                category,
                type: type as 'income' | 'expense', // 'investment' handled above
                value: numericValue,
                icon: selectedCategory?.icon || 'attach_money',
                paymentMethod: paymentMethod === 'Cartão de Crédito' ? 'Cartão de Crédito' : paymentMethod,
                installments: isInstallment ? `${installmentCount}x` : undefined,
                cardBrand: paymentMethod === 'Cartão de Crédito' ? cardBrand : undefined,
                installmentNumber: isInstallment ? 1 : undefined,
                totalInstallments: isInstallment ? installmentCount : undefined,
                isBillPayment,
                billCardBrand
            });
        }

        // Reset and Close
        resetForm();
        onClose();
    };

    const resetForm = () => {
        setDescription('');
        setValue('');
        setCategory('');
        // setDate(''); // Keep date?
        setPaymentMethod('');
        setCardBrand('');
        setIsInstallment(false);
        setInstallmentCount(1);
        setTicker('');
        setQuantity('');
        setIsBillPayment(false);
        setBillCardBrand('');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
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
                            className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all ${type === 'income' ? 'bg-blue-100 text-blue-700 shadow-sm' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
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
                        <button
                            type="button"
                            onClick={() => setType('investment')}
                            className={`flex-1 py-2 text-sm font-bold rounded-md flex items-center justify-center gap-2 transition-all ${type === 'investment' ? 'bg-green-100 text-green-700 shadow-sm' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                        >
                            <span className="material-symbols-outlined !text-lg">trending_up</span>
                            Investimento
                        </button>
                    </div>

                    {type === 'investment' ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Ticker / Código</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 uppercase"
                                        placeholder="PETR4"
                                        value={ticker}
                                        onChange={(e) => setTicker(e.target.value.toUpperCase())}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Qtd. Cotas</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.000001"
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="10"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Preço Unitário</label>
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

                            {/* Category for Investment */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Categoria</label>
                                <select
                                    required
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="" disabled>Selecione</option>
                                    <option value="Ações">Ações</option>
                                    <option value="FIIs">FIIs</option>
                                    <option value="Cripto">Cripto</option>
                                    <option value="Renda Fixa">Renda Fixa</option>
                                    <option value="Stocks">Stocks</option>
                                    <option value="Reits">Reits</option>
                                    <option value="ETF">ETF</option>
                                </select>
                            </div>

                            <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-100 dark:border-green-900/30 flex justify-between items-center">
                                <span className="text-sm font-medium text-green-900 dark:text-green-100">Total Aproximado</span>
                                <span className="text-lg font-bold text-green-700 dark:text-green-300">
                                    {quantity && value
                                        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(quantity) * parseFloat(value.replace(/\./g, '').replace(',', '.')))
                                        : 'R$ 0,00'
                                    }
                                </span>
                            </div>

                        </>
                    ) : (
                        // Standard Income/Expense Fields
                        <>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Descrição</label>
                                <input
                                    type="text"
                                    required
                                    maxLength={30}
                                    className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    placeholder={type === 'income' ? 'Ex: Salário' : 'Ex: Supermercado'}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Valor Total</label>
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
                                        {categories.filter(c => c.type === type).sort((a, b) => a.name.localeCompare(b.name)).map(cat => (
                                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                                        ))}
                                        {categories.filter(c => c.type === type).length === 0 && (
                                            <option value="Outros">Outros</option>
                                        )}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                                        {type === 'income' ? 'Meio Recebimento' : 'Meio Pagamento'}
                                    </label>
                                    <select
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={paymentMethod}
                                        onChange={(e) => {
                                            setPaymentMethod(e.target.value);
                                            if (e.target.value !== 'Cartão de Crédito') {
                                                setIsInstallment(false);
                                            }
                                        }}
                                    >
                                        <option value="" disabled>Selecione</option>
                                        <option value="Cartão de Crédito">Cartão de Crédito</option>
                                        <option value="Cartão de Débito">Cartão de Débito</option>
                                        <option value="Dinheiro">Dinheiro</option>
                                        <option value="Pix">Pix</option>
                                        <option value="TED">TED</option>
                                    </select>
                                </div>
                            </div>

                            {(paymentMethod === 'Cartão de Crédito' || paymentMethod === 'Cartão de Débito') && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Banco / Cartão</label>
                                    <select
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        value={cardBrand}
                                        onChange={(e) => setCardBrand(e.target.value)}
                                    >
                                        <option value="" disabled>Selecione o cartão</option>
                                        {creditCards.length > 0 ? (
                                            [...creditCards].sort((a, b) => a.name.localeCompare(b.name)).map(card => (
                                                <option key={card.id} value={card.name}>{card.name}</option>
                                            ))
                                        ) : (
                                            <option value="" disabled>Nenhum cartão cadastrado</option>
                                        )}
                                    </select>
                                </div>
                            )}

                            {type === 'expense' && paymentMethod === 'Cartão de Crédito' && (
                                <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tipo de Lançamento</label>
                                        <div className="flex bg-white dark:bg-slate-600 rounded-lg p-1 border border-slate-200 dark:border-slate-500">
                                            <button
                                                type="button"
                                                onClick={() => setIsInstallment(false)}
                                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!isInstallment ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500'}`}
                                            >
                                                À Vista
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setIsInstallment(true);
                                                    if (installmentCount < 2) setInstallmentCount(2);
                                                }}
                                                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${isInstallment ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-500'}`}
                                            >
                                                Parcelado
                                            </button>
                                        </div>
                                    </div>

                                    {isInstallment && (
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Número de Parcelas</label>
                                            <select
                                                required
                                                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                value={installmentCount}
                                                onChange={(e) => setInstallmentCount(Number(e.target.value))}
                                            >
                                                {[...Array(11)].map((_, i) => (
                                                    <option key={i} value={i + 2}>{i + 2}x</option>
                                                ))}
                                                <option value={18}>18x</option>
                                                <option value={24}>24x</option>
                                            </select>
                                            {value && (
                                                <p className="text-xs text-slate-500 mt-2 text-right">
                                                    Serão lançadas <strong className="text-primary">{installmentCount}x</strong> de <strong className="text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(value.replace(/\./g, '').replace(',', '.')) / installmentCount)}</strong>
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                        </>
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
