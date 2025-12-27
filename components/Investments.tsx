import React, { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { Investment, Dividend } from '../types';
import AddInvestmentModal from './AddInvestmentModal';
import AddDividendModal from './AddDividendModal';
import ViewAllDividendsModal from './ViewAllDividendsModal';

interface InvestmentsProps {
    investments: Investment[];
    dividends: Dividend[];
    onAddInvestment: (investment: Omit<Investment, 'id'>) => void;
    onEditInvestment: (id: string, investment: Omit<Investment, 'id'>) => void;
    onDeleteInvestment: (id: string) => void;
    onAddDividend: (dividend: Omit<Dividend, 'id'>) => void;
}

// Helper Functions
const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatCompactNumber = (number: number) => {
    return Intl.NumberFormat('pt-BR', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(number);
};

const formatDate = (dateStr: string) => {
    if (!dateStr || !dateStr.includes('-')) return dateStr;
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const monthNames = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    return `${day} ${monthNames[dateObj.getMonth()]} / ${year.slice(-2)}`;
};

const Investments: React.FC<InvestmentsProps> = ({ investments, dividends, onAddInvestment, onEditInvestment, onDeleteInvestment, onAddDividend }) => {
    // Get unique asset classes, sort alphabetically
    const assetClasses = Array.from(new Set(investments.map(inv => inv.category))).sort();
    // Add "Todos" as first tab
    const allTabs = ['Todos', ...assetClasses];
    const [activeTab, setActiveTab] = useState<string>('Todos');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDividendModalOpen, setIsDividendModalOpen] = useState(false);
    const [isViewAllDividendsModalOpen, setIsViewAllDividendsModalOpen] = useState(false);
    const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);

    // Get recent dividends (last 5) from props
    const recentDividends = [...dividends].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);


    const totalValue = investments.reduce((acc, curr) => acc + curr.totalValue, 0);
    const totalCost = investments.reduce((acc, curr) => acc + (curr.purchasePrice * curr.quantity), 0);
    const totalProfit = totalValue - totalCost;
    const profitPercentage = (totalProfit / totalCost) * 100;

    // Dynamic Chart Data: Last 6 months
    const last6Months = Array.from({ length: 6 }, (_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        return {
            month: d.getMonth(),
            year: d.getFullYear(),
            label: d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''),
            evolution: 0,
            dividends: 0
        };
    });

    // Populate chart data from props
    last6Months.forEach(m => {
        if (m.month === new Date().getMonth() && m.year === new Date().getFullYear()) {
            m.evolution = totalValue;
        }

        const monthDividends = dividends.filter(d => {
            const divDate = new Date(d.date + 'T00:00:00');
            return divDate.getMonth() === m.month && divDate.getFullYear() === m.year;
        });
        m.dividends = monthDividends.reduce((sum, d) => sum + d.value, 0);
    });

    const fullChartData = last6Months.map(m => ({
        month: m.label.charAt(0).toUpperCase() + m.label.slice(1),
        Patrimônio: m.evolution,
        Proventos: m.dividends
    }));

    // 3-month logic: if first 3 months are empty, show only last 3
    const isEarlyDataEmpty = fullChartData.slice(0, 3).every(d => d.Patrimônio === 0 && d.Proventos === 0);
    const chartData = isEarlyDataEmpty ? fullChartData.slice(3) : fullChartData;

    const currentMonthProventos = last6Months.find(m => m.month === new Date().getMonth() && m.year === new Date().getFullYear())?.dividends || 0;
    const lastPayingAsset = recentDividends[0];

    // Largest position calculation
    const largestPosition = investments.length > 0 ? [...investments].sort((a, b) => b.totalValue - a.totalValue)[0] : null;
    const largestPosVariation = largestPosition ? ((largestPosition.currentPrice - largestPosition.purchasePrice) / largestPosition.purchasePrice * 100) : 0;

    // Total dividends calculation
    const totalDividendsAllTime = dividends.reduce((acc, curr) => acc + curr.value, 0);

    // Monthly average calculation
    const uniqueMonths = new Set(dividends.map(d => {
        const date = new Date(d.date + 'T00:00:00');
        return `${date.getMonth()}-${date.getFullYear()}`;
    })).size;
    const averageMonthlyDividends = uniqueMonths > 0 ? totalDividendsAllTime / uniqueMonths : 0;

    // FIXED COLORS PALETTE
    const CHART_COLORS = ['#8c2bee', '#ec4899', '#3b82f6', '#06b6d4', '#f59e0b', '#7c3aed'];

    // Semantic color function matching Dashboard's "Carteira Atual" chart
    const getSemanticColor = (categoryName: string, fallbackIndex: number) => {
        const n = categoryName.toLowerCase();
        if (n.includes('cripto') || n.includes('bitcoin')) return '#f59e0b'; // Amber-500
        if (n.includes('ação') || n.includes('acoes') || n.includes('ações')) return '#22c55e'; // Green-500
        if (n.includes('fundo') || n.includes('fii')) return '#3b82f6'; // Blue-500
        if (n.includes('renda fixa') || n.includes('tesouro') || n.includes('cdb')) return '#06b6d4'; // Cyan-500
        if (n.includes('etf')) return '#f97316'; // Orange-500
        if (n.includes('exterior') || n.includes('bdr')) return '#8b5cf6'; // Violet-500
        return CHART_COLORS[fallbackIndex % CHART_COLORS.length];
    };

    // Group investments by category for the Pie Chart
    const categoryData = investments.reduce((acc, curr) => {
        const existing = acc.find(item => item.name === curr.category);
        if (existing) {
            existing.value += curr.totalValue;
        } else {
            acc.push({ name: curr.category, value: curr.totalValue, color: '#000' }); // Placeholder color
        }
        return acc;
    }, [] as { name: string; value: number; color: string }[])
        .sort((a, b) => b.value - a.value)
        .map((item, index) => ({
            ...item,
            percent: (item.value / totalValue) * 100,
            color: getSemanticColor(item.name, index)
        }));

    // Filter investments by selected tab
    const filteredInvestments = activeTab === 'Todos'
        ? investments
        : investments.filter(inv => inv.category === activeTab);

    // Calculate total for the selected tab
    const tabTotal = filteredInvestments.reduce((acc, inv) => acc + inv.totalValue, 0);

    // Handle adding new investment
    const handleAddClick = () => {
        setEditingInvestment(null);
        setIsModalOpen(true);
    };

    // Handle editing investment
    const handleEditClick = (investment: Investment) => {
        setEditingInvestment(investment);
        setIsModalOpen(true);
    };

    // Handle deleting investment
    const handleDeleteClick = (id: string, name: string) => {
        onDeleteInvestment(id);
    };

    // Handle saving investment
    const handleSaveInvestment = (investmentData: Omit<Investment, 'id'>) => {
        if (editingInvestment) {
            onEditInvestment(editingInvestment.id, investmentData);
        } else {
            onAddInvestment(investmentData);
        }
        setIsModalOpen(false);
        setEditingInvestment(null);
    };

    // Handle saving dividend
    const handleSaveDividend = (dividendData: Omit<Dividend, 'id'>) => {
        onAddDividend(dividendData);
        setIsDividendModalOpen(false);
    };




    const CustomTooltip = ({ active, payload, label, colorKey, indicatorColor }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: indicatorColor || payload[0].color || payload[0].fill }}></span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{payload[0].name}:</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(payload[0].value)}</span>
                </div>
            );
        }
        return null;
    };

    const CustomPieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }}></span>
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{data.name}:</span>
                    <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{formatCurrency(data.value)}</span>
                        <span className="text-xs text-slate-500 font-medium">({data.percent.toFixed(1)}%)</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    const EmptyState = ({ message = "SEM DADOS", icon = "database_off", small = false }) => (
        <div className={`flex flex-col items-center justify-center ${small ? 'py-2' : 'py-12'} text-slate-400 dark:text-slate-500 w-full`}>
            <span className={`material-symbols-outlined ${small ? '!text-2xl' : '!text-4xl'} mb-2 opacity-20`}>{icon}</span>
            <p className={`${small ? 'text-[8px]' : 'text-[10px]'} font-bold uppercase tracking-widest`}>{message}</p>
        </div>
    );

    // Render table for selected asset class
    const renderAssetTable = () => {
        // If "Todos" tab is selected, group by category
        if (activeTab === 'Todos') {
            return (
                <div className="overflow-x-auto">
                    {assetClasses.map((category) => {
                        const categoryInvestments = investments.filter(inv => inv.category === category);
                        if (categoryInvestments.length === 0) return null;

                        return (
                            <div key={category} className="mb-8 last:mb-0">
                                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider px-6 py-3 bg-slate-50 dark:bg-slate-700/50">
                                    {category}
                                </h4>
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 dark:bg-slate-700/50 text-slate-500 uppercase text-[10px] tracking-wider">
                                            <th className="px-6 py-3">Ativo</th>
                                            <th className="px-6 py-3 text-right">Qtde</th>
                                            <th className="px-6 py-3 text-right">Preço Médio</th>
                                            <th className="px-6 py-3 text-right">Preço Atual</th>
                                            <th className="px-6 py-3 text-right">Variação</th>
                                            <th className="px-6 py-3 text-right">Total</th>
                                            <th className="px-6 py-3 text-center">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                        {categoryInvestments.map((asset) => renderAssetRow(asset))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })}
                </div>
            );
        }

        // Regular table for specific category
        return (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50 dark:bg-slate-700/50 text-slate-500 uppercase text-[10px] tracking-wider">
                            <th className="px-6 py-3">Ativo</th>
                            <th className="px-6 py-3 text-right">Qtde</th>
                            <th className="px-6 py-3 text-right">Preço Médio</th>
                            <th className="px-6 py-3 text-right">Preço Atual</th>
                            <th className="px-6 py-3 text-right">Variação</th>
                            <th className="px-6 py-3 text-right">Total</th>
                            <th className="px-6 py-3 text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {filteredInvestments.map((asset) => renderAssetRow(asset))}
                    </tbody>
                </table>
            </div>
        );
    };

    // Render individual asset row
    const renderAssetRow = (asset: Investment) => {
        const assetProfit = (asset.currentPrice - asset.purchasePrice) * asset.quantity;
        const assetProfitPercent = ((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;

        return (
            <tr key={asset.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl bg-slate-50 dark:bg-slate-700`} style={{ color: asset.color }}>
                            {asset.ticker ? <span className="font-bold text-xs">{asset.ticker}</span> : <span className="material-symbols-outlined">{asset.icon}</span>}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{asset.name}</p>
                            <p className="text-xs text-slate-500">{asset.ticker || asset.category}</p>
                        </div>
                    </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">{asset.quantity}</td>
                <td className="px-6 py-4 text-right text-sm text-slate-500">R$ {asset.purchasePrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 text-right text-sm font-bold">R$ {asset.currentPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-4 text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${assetProfit >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {assetProfitPercent >= 0 ? '+' : ''}{assetProfitPercent.toFixed(2)}%
                    </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-bold text-slate-900 dark:text-white">
                    R$ {asset.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                        <button
                            onClick={() => handleEditClick(asset)}
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <span className="material-symbols-outlined !text-lg">edit</span>
                        </button>
                        <button
                            onClick={() => handleDeleteClick(asset.id, asset.name)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Excluir"
                        >
                            <span className="material-symbols-outlined !text-lg">delete</span>
                        </button>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="mt-6 flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-primary uppercase tracking-wider mb-2">INVESTIMENTOS</h2>
                    <p className="text-slate-500 dark:text-slate-400">Gerencie sua carteira de ativos e acompanhe seus rendimentos.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsDividendModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition-colors text-sm font-bold">
                        <span className="material-symbols-outlined !text-lg">payments</span>
                        Adicionar Dividendo
                    </button>
                    <button
                        onClick={handleAddClick}
                        className="flex items-center gap-2 px-4 py-3 bg-primary text-white rounded-lg shadow-md hover:bg-primary-dark transition-colors text-sm font-bold"
                    >
                        <span className="material-symbols-outlined !text-lg">add</span>
                        Adicionar Investimento
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 min-h-[140px] flex flex-col justify-center">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Patrimônio Total</p>
                    {totalValue > 0 ? (
                        <>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                            <div className="flex items-center gap-1 mt-2">
                                <span className="material-symbols-outlined text-green-500 text-sm">trending_up</span>
                                <span className="text-sm text-green-500 font-bold">+R$ {totalProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({profitPercentage.toFixed(2)}%)</span>
                            </div>
                        </>
                    ) : <EmptyState message="SEM PATRIMÔNIO" small icon="account_balance_wallet" />}
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 min-h-[140px] flex flex-col justify-center">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Maior Posição</p>
                    {largestPosition ? (
                        <div className="mt-1">
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white">
                                    {formatCurrency(largestPosition.totalValue)}
                                </h3>
                                <div className={`flex items-center text-xs font-bold ${largestPosVariation >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    <span className="material-symbols-outlined !text-sm">
                                        {largestPosVariation >= 0 ? 'trending_up' : 'trending_down'}
                                    </span>
                                    {largestPosVariation >= 0 ? '+' : ''}{largestPosVariation.toFixed(2)}%
                                </div>
                            </div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
                                {largestPosition.name}
                            </p>
                        </div>
                    ) : <EmptyState message="SEM ATIVOS" small icon="analytics" />}
                </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 min-h-[140px] flex flex-col justify-center">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-2">Total Proventos</p>
                    {totalDividendsAllTime > 0 ? (
                        <>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(totalDividendsAllTime)}</h3>
                            <p className="text-xs text-green-500 font-bold mt-2">Média mensal: {formatCurrency(averageMonthlyDividends)}</p>
                        </>
                    ) : <EmptyState message="SEM PROVENTOS" small icon="payments" />}
                </div>
            </div>

            {/* Charts Section - First Row: Evolution (2 cols) + Allocation (1 col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Area Chart - Portfolio Growth - Takes 2 columns */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Evolução do Patrimônio</h3>
                    <div className="h-[300px] w-full">
                        {chartData.some(d => d.Patrimônio > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8c2bee" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#8c2bee" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis hide />
                                    <Tooltip content={<CustomTooltip indicatorColor="#8c2bee" />} />
                                    <Area type="monotone" dataKey="Patrimônio" stroke="#8c2bee" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : <EmptyState message="SEM DADOS PARA O GRÁFICO" icon="monitoring" />}
                    </div>
                </div>

                {/* Pie Chart - Allocation - Takes 1 column */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Alocação</h3>
                    <div className="h-[220px] w-full relative">
                        {categoryData.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={70}
                                            outerRadius={95}
                                            paddingAngle={5}
                                            minAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<CustomPieTooltip />} />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                    <p className="text-xs text-slate-500 font-medium uppercase">Total</p>
                                    <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCompactNumber(totalValue)}</p>
                                </div>
                            </>
                        ) : <EmptyState message="SEM ALOCAÇÃO" icon="pie_chart" />}
                    </div>
                    <div className="space-y-3 mt-4">
                        {categoryData.length > 0 ? categoryData.map((item) => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                                    <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {((item.value / totalValue) * 100).toFixed(1)}%
                                </span>
                            </div>
                        )) : <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider py-4">Nenhum ativo cadastrado</p>}
                    </div>
                </div>
            </div>

            {/* Second row - Dividends Chart (2 cols) + Recent Dividends Table (1 col) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Bar Chart - Dividends - Takes 2 columns */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Proventos Recebidos</h3>
                    <div className="h-[300px] w-full">
                        {chartData.some(d => d.Proventos > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} barSize={30}>
                                    <defs>
                                        <linearGradient id="colorDividends" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#8c2bee" stopOpacity={0.8} />
                                            <stop offset="100%" stopColor="#8c2bee" stopOpacity={0.4} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                                    <YAxis hide />
                                    <Tooltip content={<CustomTooltip indicatorColor="#8c2bee" />} cursor={{ fill: 'rgba(140, 43, 238, 0.1)' }} />
                                    <Bar dataKey="Proventos" fill="#8c2bee" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <EmptyState message="SEM PROVENTOS PARA O GRÁFICO" icon="bar_chart" />}
                    </div>
                </div>

                {/* Recent Dividends Table - Takes 1 column */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Últimos Dividendos</h3>
                        <button
                            onClick={() => setIsViewAllDividendsModalOpen(true)}
                            className="text-xs text-primary hover:text-primary-dark font-semibold flex items-center gap-1 transition-colors"
                        >
                            Ver todos
                            <span className="material-symbols-outlined !text-sm">arrow_forward</span>
                        </button>
                    </div>
                    <div className="space-y-3">
                        {recentDividends.length > 0 ? recentDividends.map((dividend) => (
                            <div key={dividend.id} className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700 last:border-0">
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{dividend.assetName}</p>
                                    <p className="text-xs text-slate-500">{formatDate(dividend.date)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-green-600">R$ {dividend.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        )) : <EmptyState message="SEM RENDIMENTOS" icon="history" />}
                    </div>
                </div>
            </div>

            {/* Tabbed Assets Table */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold">Meus Ativos</h3>
                        <div className="text-right">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {activeTab === 'Todos' ? 'Total Geral' : `Total em ${activeTab}`}
                            </p>
                            <p className="text-lg font-bold text-slate-900 dark:text-white">R$ {tabTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {allTabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>
                {renderAssetTable()}
            </div>

            {/* Add/Edit Investment Modal */}
            <AddInvestmentModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingInvestment(null);
                }}
                onSave={handleSaveInvestment}
                investmentToEdit={editingInvestment}
            />

            {/* Add Dividend Modal */}
            <AddDividendModal
                isOpen={isDividendModalOpen}
                onClose={() => setIsDividendModalOpen(false)}
                onSave={handleSaveDividend}
                investments={investments}
            />

            {/* View All Dividends Modal */}
            <ViewAllDividendsModal
                isOpen={isViewAllDividendsModalOpen}
                onClose={() => setIsViewAllDividendsModalOpen(false)}
                dividends={dividends}
            />
        </div>
    );
};

export default Investments;
