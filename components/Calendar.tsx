import React, { useState, useEffect } from 'react';
import { RecurringTransaction, Transaction, CreditCard } from '../types';

interface CalendarProps {
    recurringTransactions: RecurringTransaction[];
    transactions: Transaction[];
    creditCards: CreditCard[];
    onAddRecurringTransaction: (transaction: Omit<RecurringTransaction, 'id'>) => void;
    onEditRecurringTransaction: (id: string, transaction: Omit<RecurringTransaction, 'id'>) => void;
    onDeleteRecurringTransaction: (id: string) => void;
    onPayBill: (billData: { cardName: string; amount: number }) => void;
}

const CATEGORIES = {
    income: [
        { name: 'Salário', icon: 'payments' },
        { name: 'Freelance', icon: 'work' },
        { name: 'Dividendos', icon: 'account_balance' },
        { name: 'Outros', icon: 'more_horiz' },
    ],
    investment: [
        { name: 'Ações', icon: 'show_chart' },
        { name: 'Fundos Imobiliários', icon: 'apartment' },
        { name: 'Renda Fixa', icon: 'savings' },
        { name: 'Criptomoedas', icon: 'currency_bitcoin' },
        { name: 'Outros', icon: 'more_horiz' },
    ],
    expense: [
        { name: 'Moradia', icon: 'home' },
        { name: 'Alimentação', icon: 'restaurant' },
        { name: 'Transporte', icon: 'directions_car' },
        { name: 'Saúde', icon: 'favorite' },
        { name: 'Educação', icon: 'school' },
        { name: 'Lazer', icon: 'sports_esports' },
        { name: 'Assinaturas', icon: 'subscriptions' },
        { name: 'Outros', icon: 'more_horiz' },
    ],
};

const WEEKDAYS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const HOLIDAYS: { [key: string]: string } = {
    '01-01': 'Ano Novo',
    '04-21': 'Tiradentes',
    '05-01': 'Dia do Trabalho',
    '09-07': 'Independência',
    '10-12': 'N. Sra. Aparecida',
    '11-02': 'Finados',
    '11-15': 'Proclamação da República',
    '12-25': 'Natal',
};

const getEasterDate = (year: number): Date => {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month, day);
};

const getVariableHolidays = (year: number): { [key: string]: string } => {
    const easter = getEasterDate(year);
    const holidays: { [key: string]: string } = {};

    const carnival = new Date(easter);
    carnival.setDate(easter.getDate() - 47);
    holidays[`${(carnival.getMonth() + 1).toString().padStart(2, '0')}-${carnival.getDate().toString().padStart(2, '0')}`] = 'Carnaval';

    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2);
    holidays[`${(goodFriday.getMonth() + 1).toString().padStart(2, '0')}-${goodFriday.getDate().toString().padStart(2, '0')}`] = 'Sexta-feira Santa';

    const corpusChristi = new Date(easter);
    corpusChristi.setDate(easter.getDate() + 60);
    holidays[`${(corpusChristi.getMonth() + 1).toString().padStart(2, '0')}-${corpusChristi.getDate().toString().padStart(2, '0')}`] = 'Corpus Christi';

    return holidays;
};

// Color scheme: blue=income, green=investment, red=expense
const getTypeColor = (type: 'income' | 'expense' | 'investment', variant: 'bg' | 'text' | 'border' = 'bg') => {
    const colors = {
        income: {
            bg: 'bg-blue-100 dark:bg-blue-900/40',
            text: 'text-blue-700 dark:text-blue-300',
            border: 'border-blue-500',
            solid: 'bg-blue-500',
            hover: 'hover:bg-blue-200 dark:hover:bg-blue-800/40'
        },
        investment: {
            bg: 'bg-green-100 dark:bg-green-900/40',
            text: 'text-green-700 dark:text-green-300',
            border: 'border-green-500',
            solid: 'bg-green-500',
            hover: 'hover:bg-green-200 dark:hover:bg-green-800/40'
        },
        expense: {
            bg: 'bg-red-100 dark:bg-red-900/40',
            text: 'text-red-700 dark:text-red-300',
            border: 'border-red-500',
            solid: 'bg-red-500',
            hover: 'hover:bg-red-200 dark:hover:bg-red-800/40'
        }
    };
    return colors[type];
};

type ViewMode = 'month' | 'week' | 'day';
type TransactionType = 'income' | 'expense' | 'investment';

const Calendar: React.FC<CalendarProps> = ({
    recurringTransactions,
    transactions = [],
    creditCards = [],
    onAddRecurringTransaction,
    onEditRecurringTransaction,
    onDeleteRecurringTransaction,
    onPayBill
}) => {
    const today = new Date();
    const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [viewMode, setViewMode] = useState<ViewMode>('month');
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);

    // Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
    const [formData, setFormData] = useState({
        description: '',
        category: 'Outros',
        type: 'expense' as TransactionType,
        value: '',
        icon: 'more_horiz'
    });
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isRecurring, setIsRecurring] = useState(true); // Default to true implies "Every Month" generally, confusing naming in original but keeping for now.
    const [selectedBill, setSelectedBill] = useState<{ id: string; cardName: string; amount: number; day: number } | null>(null);

    const allHolidays = { ...HOLIDAYS, ...getVariableHolidays(currentDate.getFullYear()) };

    const isHoliday = (date: Date): string | null => {
        const key = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        return allHolidays[key] || null;
    };

    const getHolidaysInMonth = (): { day: number; name: string }[] => {
        const holidays: { day: number; name: string }[] = [];
        const daysInMonth = getDaysInMonth(currentDate);

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const holidayName = isHoliday(date);
            if (holidayName) {
                holidays.push({ day, name: holidayName });
            }
        }
        return holidays;
    };

    const formatCurrencyValue = (value: string): string => {
        const numericValue = value.replace(/[^\d,]/g, '').replace(',', '.');
        const parsed = parseFloat(numericValue);
        if (isNaN(parsed)) return '';
        return parsed.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const handleValueBlur = () => {
        if (formData.value) {
            const formatted = formatCurrencyValue(formData.value);
            if (formatted) {
                setFormData({ ...formData, value: `R$ ${formatted}` });
            }
        }
    };

    const handleValueChange = (value: string) => {
        // Remove R$ prefix if user types it, we'll add it on blur
        const cleaned = value.replace('R$', '').trim();
        setFormData({ ...formData, value: cleaned });
    };

    const resetForm = () => {
        setFormData({
            description: '',
            category: 'Outros',
            type: 'expense',
            value: '',
            icon: 'more_horiz'
        });
        setStartDate('');
        setEndDate('');
        setIsRecurring(true);
        setEditingTransaction(null);
    };

    const getDaysFromRange = (): number[] => {
        if (!startDate) return [];
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : start;
        const days: number[] = [];
        const current = new Date(start);
        while (current <= end) {
            days.push(current.getDate());
            current.setDate(current.getDate() + 1);
        }
        return days;
    };

    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const getCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

        const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

        for (let i = firstDay - 1; i >= 0; i--) {
            const day = prevMonthDays - i;
            days.push({
                day,
                isCurrentMonth: false,
                date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, day)
            });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            days.push({
                day: i,
                isCurrentMonth: true,
                date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i)
            });
        }

        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({
                day: i,
                isCurrentMonth: false,
                date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i)
            });
        }

        return days;
    };

    const getWeekDays = () => {
        const startOfWeek = new Date(currentDate);
        const dayOfWeek = startOfWeek.getDay();
        startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
        const days: Date[] = [];
        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const navigate = (direction: number) => {
        if (viewMode === 'month') {
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
        } else if (viewMode === 'week') {
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() + (direction * 7));
            setCurrentDate(newDate);
        } else {
            const newDate = new Date(currentDate);
            newDate.setDate(currentDate.getDate() + direction);
            setCurrentDate(newDate);
        }
    };

    const getProjectedBills = () => {
        // Calculate only if we have necessary data
        if (!creditCards.length || !transactions.length) return [];

        const bills: { day: number; amount: number; cardName: string, id: string; type: 'expense' }[] = [];

        creditCards.forEach(card => {
            // Filter transactions for this card that fall in the current view Month/Year
            const currentMonthTransactions = transactions.filter(t => {
                if (t.paymentMethod !== 'Cartão de Crédito') return false;
                // Match card brand/name logic. 
                // Note: AddTransactionModal saves cardName in cardBrand field or we need to match carefully.
                // In AddTransactionModal: setCardBrand(card.name) -> stored in t.cardBrand
                if (t.cardBrand !== card.name) return false;

                const tDate = new Date(t.date);
                // Adjust for timezone if needed, but assuming local date string YYYY-MM-DD
                // We use simple string parsing to be safe against timezone shifts
                const [y, m, d] = t.date.split('-').map(Number);

                return y === currentDate.getFullYear() && (m - 1) === currentDate.getMonth();
            });

            const total = currentMonthTransactions.reduce((sum, t) => sum + t.value, 0);

            if (total > 0) {
                bills.push({
                    day: card.closingDay,
                    amount: total,
                    cardName: card.name,
                    id: `bill-${card.id}`,
                    type: 'expense'
                });
            }
        });
        return bills;
    };

    const projectedBills = getProjectedBills();

    const getTransactionsForDay = (day: number) => {
        const recurring = recurringTransactions.filter(t => t.daysOfMonth.includes(day));
        const bills = projectedBills.filter(b => b.day === day);
        return { recurring, bills };
    };

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const handleDayClick = (day: number) => {
        resetForm();
        const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        setStartDate(dateStr);
        setEndDate(dateStr);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const handleEditClick = (transaction: RecurringTransaction) => {
        setEditingTransaction(transaction);
        const sortedDays = [...transaction.daysOfMonth].sort((a, b) => a - b);
        const firstDay = sortedDays[0];
        const lastDay = sortedDays[sortedDays.length - 1];

        const startStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${firstDay.toString().padStart(2, '0')}`;
        const endStr = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;

        setStartDate(startStr);
        setEndDate(endStr);
        setIsRecurring(true); // Existing ones are always recurring
        setFormData({
            description: transaction.description,
            category: transaction.category,
            type: transaction.type as TransactionType,
            value: `R$ ${transaction.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
            icon: transaction.icon
        });
        setIsModalOpen(true);
    };

    const handleBillClick = (bill: { id: string; cardName: string; amount: number; day: number }) => {
        setSelectedBill(bill);
    };

    const handleSubmit = () => {
        const days = getDaysFromRange();
        if (days.length === 0 || !formData.description || !formData.value) return;

        // Parse value removing R$ and formatting
        const numericValue = formData.value.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
        const parsedValue = parseFloat(numericValue);
        if (isNaN(parsedValue)) return;

        const transactionData = {
            daysOfMonth: days,
            description: formData.description,
            category: formData.category,
            type: formData.type as 'income' | 'expense',
            value: parsedValue,
            icon: formData.icon
        };

        if (editingTransaction) {
            onEditRecurringTransaction(editingTransaction.id, transactionData);
        } else {
            onAddRecurringTransaction(transactionData);
        }

        setIsModalOpen(false);
        resetForm();
    };

    const handleCategoryChange = (categoryName: string) => {
        const cats = CATEGORIES[formData.type as keyof typeof CATEGORIES] || [];
        const cat = cats.find(c => c.name === categoryName);
        setFormData({
            ...formData,
            category: categoryName,
            icon: cat?.icon || 'more_horiz'
        });
    };

    const handleTypeChange = (type: TransactionType) => {
        const cats = CATEGORIES[type];
        setFormData({
            ...formData,
            type,
            category: cats[0]?.name || 'Outros',
            icon: cats[0]?.icon || 'more_horiz'
        });
    };

    const isToday = (date: Date) => {
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const getHeaderTitle = () => {
        if (viewMode === 'month') {
            return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        } else if (viewMode === 'week') {
            const weekDays = getWeekDays();
            const start = weekDays[0];
            const end = weekDays[6];
            if (start.getMonth() === end.getMonth()) {
                return `${start.getDate()} - ${end.getDate()} de ${MONTHS[start.getMonth()]} ${start.getFullYear()}`;
            }
            return `${start.getDate()} ${MONTHS[start.getMonth()].slice(0, 3)} - ${end.getDate()} ${MONTHS[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`;
        } else {
            return `${currentDate.getDate()} de ${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        }
    };

    const renderMonthView = () => {
        const calendarDays: { day: number; isCurrentMonth: boolean; date: Date }[] = [];
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        // Days from previous month
        for (let i = 0; i < firstDayOfMonth.getDay(); i++) {
            const date = new Date(year, month, -i);
            calendarDays.unshift({ day: date.getDate(), isCurrentMonth: false, date });
        }

        // Days from current month
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            calendarDays.push({ day: i, isCurrentMonth: true, date: new Date(year, month, i) });
        }

        // Days from next month
        const remainingCells = 42 - calendarDays.length;
        for (let i = 1; i <= remainingCells; i++) {
            calendarDays.push({ day: i, isCurrentMonth: false, date: new Date(year, month + 1, i) });
        }

        const weeks: typeof calendarDays[] = [];
        for (let i = 0; i < calendarDays.length; i += 7) {
            weeks.push(calendarDays.slice(i, i + 7));
        }

        return (
            <div className="flex-1 overflow-auto">
                <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    {WEEKDAYS.map((day, idx) => (
                        <div
                            key={day}
                            className={`py-4 text-center text-sm font-semibold ${idx === 0 ? 'text-red-500' : idx === 6 ? 'text-primary' : 'text-slate-600 dark:text-slate-400'}`}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                <div className="flex-1">
                    {weeks.map((week, weekIdx) => (
                        <div key={weekIdx} className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                            {week.map((dayInfo, dayIdx) => {
                                let dayTransactions: any[] = [];
                                if (dayInfo.isCurrentMonth) {
                                    const { recurring, bills } = getTransactionsForDay(dayInfo.day);
                                    dayTransactions = [...recurring, ...bills];
                                }
                                const isTodayDate = isToday(dayInfo.date);
                                const isSunday = dayIdx === 0;
                                const isSaturday = dayIdx === 6;
                                const holidayName = dayInfo.isCurrentMonth ? isHoliday(dayInfo.date) : null;

                                return (
                                    <div
                                        key={dayIdx}
                                        className={`min-h-[120px] p-2 border-r border-slate-200 dark:border-slate-700 last:border-r-0 transition-colors cursor-pointer relative
                      ${dayInfo.isCurrentMonth ? 'bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-800' : 'bg-slate-50/50 dark:bg-slate-900/30'}
                      ${isTodayDate ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                        onClick={() => dayInfo.isCurrentMonth && handleDayClick(dayInfo.day)}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className={`text-sm font-medium ${!dayInfo.isCurrentMonth
                                                ? 'text-slate-400 dark:text-slate-600'
                                                : isTodayDate
                                                    ? 'text-primary font-bold'
                                                    : dayIdx === 0 // Sunday
                                                        ? 'text-red-500'
                                                        : dayIdx === 6 // Saturday
                                                            ? 'text-primary'
                                                            : 'text-slate-700 dark:text-slate-300'
                                                }`}>
                                                {dayInfo.day}
                                            </div>
                                            {holidayName && (
                                                <div className="w-2 h-2 rounded-full bg-orange-500" title={holidayName} />
                                            )}
                                        </div>

                                        {dayInfo.isCurrentMonth && (
                                            <div className="space-y-1 mt-1">
                                                {dayTransactions.slice(0, 3).map((t: any) => {
                                                    const isBill = t.id.startsWith('bill-');
                                                    const colors = getTypeColor(t.type as TransactionType);
                                                    return (
                                                        <div
                                                            key={t.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (isBill) {
                                                                    handleBillClick(t);
                                                                } else {
                                                                    handleEditClick(t);
                                                                }
                                                            }}
                                                            className={`text-xs px-2 py-0.5 rounded truncate cursor-pointer ${isBill ? 'border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20' : colors.bg} ${colors.text} ${colors.hover}`}
                                                        >
                                                            <div className="flex items-center gap-1">
                                                                {isBill && <span className="material-symbols-outlined !text-[10px]">credit_card</span>}
                                                                <span className="truncate">{isBill ? `Vencimento ${t.cardName}` : t.description}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {dayTransactions.length > 3 && (
                                                    <div className="text-xs text-slate-500 px-2">+{dayTransactions.length - 3} mais</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>

                {/* Bill Modal */}
                {selectedBill && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-surface-dark rounded-2xl w-full max-w-sm p-6 shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                                    <span className="material-symbols-outlined text-3xl">credit_card</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                    Fatura {selectedBill.cardName}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    Vencimento dia {selectedBill.day}
                                </p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6 text-center border border-slate-100 dark:border-slate-700">
                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Valor Total</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">
                                    {formatCurrency(selectedBill.amount)}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedBill(null)}
                                    className="flex-1 py-2.5 px-4 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Fechar
                                </button>
                                <button
                                    onClick={() => {
                                        onPayBill({ cardName: selectedBill.cardName, amount: selectedBill.amount });
                                        setSelectedBill(null);
                                    }}
                                    className="flex-1 py-2.5 px-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium shadow-lg shadow-primary/30 transition-all flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined !text-[18px]">payments</span>
                                    Pagar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {getHolidaysInMonth().length > 0 && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500" />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Feriados do mês:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {getHolidaysInMonth().map(h => (
                                <span key={h.day} className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                                    {h.day} - {h.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Legend */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex flex-wrap gap-4 text-xs justify-center">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-blue-500" />
                            <span className="text-slate-600 dark:text-slate-400">Receita</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-green-500" />
                            <span className="text-slate-600 dark:text-slate-400">Investimento</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded bg-red-500" />
                            <span className="text-slate-600 dark:text-slate-400">Despesa</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderWeekView = () => {
        const days = getWeekDays();
        const hours = Array.from({ length: 24 }, (_, i) => i);

        return (
            <div className="flex h-full overflow-y-auto custom-scrollbar">
                {/* Time Column */}
                <div className="w-16 flex-shrink-0 bg-slate-50/50 dark:bg-slate-800/30 border-r border-slate-200 dark:border-slate-700 pt-10">
                    {hours.map(hour => (
                        <div key={hour} className="h-20 text-xs text-slate-400 dark:text-slate-500 text-right pr-2 -mt-2">
                            {hour.toString().padStart(2, '0')}:00
                        </div>
                    ))}
                </div>

                {/* Days Columns */}
                <div className="flex flex-1 min-w-[800px]">
                    {days.map((day, idx) => {
                        const { recurring, bills } = getTransactionsForDay(day.getDate());
                        const dayTransactions = [...recurring, ...bills];
                        const holidayName = isHoliday(day);

                        return (
                            <div key={idx} className="flex-1 border-r border-slate-200 dark:border-slate-700 min-w-[120px]">
                                {/* Header */}
                                <div className={`p-2 text-center border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-surface-dark z-10 ${isToday(day) ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                                    <div className="text-xs uppercase text-slate-500 font-bold mb-1">{WEEKDAYS[day.getDay()]}</div>
                                    <div className={`text-lg font-bold w-8 h-8 rounded-full flex items-center justify-center mx-auto ${isToday(day) ? 'bg-primary text-white shadow-md' : 'text-slate-800 dark:text-white'}`}>
                                        {day.getDate()}
                                    </div>
                                    {holidayName && (
                                        <div className="mt-1">
                                            <span className="text-[10px] px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full truncate max-w-full block">
                                                {holidayName}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div
                                    className="relative h-[1440px] bg-white dark:bg-surface-dark bg-grid-slate-100 dark:bg-grid-slate-800/[0.05] bg-[size:20px_20px]"
                                    onClick={() => handleDayClick(day.getDate())}
                                >
                                    {/* Map transactions to visual blocks */}
                                    {dayTransactions.map((t: any, i) => {
                                        const isBill = t.id.startsWith('bill-');
                                        const colors = getTypeColor(t.type as TransactionType, 'bg');
                                        return (
                                            <div
                                                key={t.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!isBill) handleEditClick(t);
                                                }}
                                                className={`absolute left-1 right-1 p-2 rounded text-xs border shadow-sm cursor-pointer hover:brightness-95 transition-all ${isBill ? 'border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20' : colors.bg} ${colors.text} ${colors.border}`}
                                                style={{
                                                    top: `${(9 + i) * 60}px`,
                                                    height: '50px'
                                                }}
                                            >
                                                <div className="font-bold truncate">{isBill ? `Vencimento ${t.cardName}` : t.description}</div>
                                                <div className="truncate">{formatCurrency(t.value)}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderDayView = () => {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const { recurring, bills } = getTransactionsForDay(currentDate.getDate());
        const dayTransactions = [...recurring, ...bills];
        const holidayName = isHoliday(currentDate);

        return (
            <div className="flex h-full flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/20">
                    <div className="flex items-center gap-4">
                        <span className={`text-lg font-semibold ${isToday(currentDate) ? 'text-primary' : 'text-slate-700 dark:text-slate-300'}`}>
                            {WEEKDAYS[currentDate.getDay()]} {currentDate.getDate()}/{(currentDate.getMonth() + 1).toString().padStart(2, '0')}
                        </span>
                        {holidayName && (
                            <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full">
                                {holidayName}
                            </span>
                        )}
                    </div>
                    {dayTransactions.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {dayTransactions.map((t: any) => {
                                const isBill = t.id.startsWith('bill-');
                                const colors = getTypeColor(t.type as TransactionType);
                                return (
                                    <div
                                        key={t.id}
                                        onClick={() => !isBill && handleEditClick(t)}
                                        className={`text-xs px-3 py-1 rounded-full cursor-pointer ${isBill ? 'bg-red-100 text-red-700' : `${colors.bg} ${colors.text} ${colors.hover}`}`}
                                    >
                                        {isBill ? `Vencimento ${t.cardName}` : t.description} - {formatCurrency(t.value)}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex-1">
                    {hours.map(hour => (
                        <div key={hour} className="flex border-b border-slate-100 dark:border-slate-800">
                            <div className="w-20 py-4 px-3 text-xs text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/30 text-right flex-shrink-0">
                                {hour.toString().padStart(2, '0')}:00
                            </div>
                            <div
                                className="flex-1 min-h-[56px] border-l border-slate-200 dark:border-slate-700 border-dashed cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                onClick={() => handleDayClick(currentDate.getDate())}
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-[600px] flex flex-col animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-white dark:bg-surface-dark rounded-t-2xl border border-slate-200 dark:border-slate-700 border-b-0 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-9 h-9 flex items-center justify-center border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 !text-[20px]">chevron_left</span>
                    </button>
                    <button
                        onClick={() => navigate(1)}
                        className="w-9 h-9 flex items-center justify-center border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 !text-[20px]">chevron_right</span>
                    </button>
                    <button
                        onClick={openAddModal}
                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg shadow-lg shadow-primary/30 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined !text-[18px]">add</span>
                        Adicionar
                    </button>
                </div>

                <h1 className="text-xl font-semibold text-slate-800 dark:text-white order-first md:order-none">
                    {getHeaderTitle()}
                </h1>

                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                    {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === mode
                                ? 'bg-primary text-white shadow-sm'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                                }`}
                        >
                            {mode === 'month' ? 'MÊS' : mode === 'week' ? 'SEMANA' : 'DIA'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Calendar Content */}
            <div className="flex-1 bg-white dark:bg-surface-dark rounded-b-2xl border border-slate-200 dark:border-slate-700 border-t-0 overflow-hidden flex flex-col">
                {viewMode === 'month' && renderMonthView()}
                {viewMode === 'week' && renderWeekView()}
                {viewMode === 'day' && renderDayView()}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                                    {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
                                </h2>
                                <button
                                    onClick={() => { setIsModalOpen(false); resetForm(); }}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-slate-500">close</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-5">
                            {/* Recurring Toggle */}
                            {!editingTransaction && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsRecurring(true)}
                                        className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${isRecurring
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined !text-[18px]">repeat</span>
                                        Fixo (Recorrente)
                                    </button>
                                    <button
                                        onClick={() => setIsRecurring(false)}
                                        className={`flex-1 py-2 px-4 rounded-xl font-medium text-sm transition-all flex items-center justify-center gap-2 ${!isRecurring
                                            ? 'bg-primary text-white shadow-lg'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined !text-[18px]">event</span>
                                        Único
                                    </button>
                                </div>
                            )}

                            {/* Date Range */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Data Início</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Data Fim</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        min={startDate}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                    />
                                </div>
                            </div>

                            {/* Type Toggle - 3 options */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleTypeChange('income')}
                                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${formData.type === 'income'
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    Receita
                                </button>
                                <button
                                    onClick={() => handleTypeChange('investment')}
                                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${formData.type === 'investment'
                                        ? 'bg-green-500 text-white shadow-lg'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    Investimento
                                </button>
                                <button
                                    onClick={() => handleTypeChange('expense')}
                                    className={`flex-1 py-3 rounded-xl font-semibold transition-all ${formData.type === 'expense'
                                        ? 'bg-red-500 text-white shadow-lg'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                        }`}
                                >
                                    Despesa
                                </button>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Descrição</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Ex: Aluguel, Salário, Ações..."
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Value */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Valor</label>
                                <input
                                    type="text"
                                    value={formData.value}
                                    onChange={(e) => handleValueChange(e.target.value)}
                                    onBlur={handleValueBlur}
                                    placeholder="0,00"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Categoria</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => handleCategoryChange(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                                >
                                    {(CATEGORIES[formData.type as keyof typeof CATEGORIES] || []).map(cat => (
                                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                {editingTransaction && (
                                    <button
                                        onClick={() => {
                                            onDeleteRecurringTransaction(editingTransaction.id);
                                            setIsModalOpen(false);
                                            resetForm();
                                        }}
                                        className="px-4 py-3 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 font-semibold rounded-xl transition-all"
                                    >
                                        <span className="material-symbols-outlined !text-[20px]">delete</span>
                                    </button>
                                )}
                                <button
                                    onClick={handleSubmit}
                                    disabled={getDaysFromRange().length === 0 || !formData.description || !formData.value}
                                    className="flex-1 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl shadow-lg shadow-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {editingTransaction ? 'Salvar Alterações' : 'Adicionar Lançamento'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
