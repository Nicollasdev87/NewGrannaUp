import React, { useState } from 'react';

interface Dividend {
    id: string;
    assetName: string;
    value: number;
    date: string;
}

interface ViewAllDividendsModalProps {
    isOpen: boolean;
    onClose: () => void;
    dividends: Dividend[];
}

const ViewAllDividendsModal: React.FC<ViewAllDividendsModalProps> = ({ isOpen, onClose, dividends }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAsset, setFilterAsset] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Get unique assets for filter
    const uniqueAssets = Array.from(new Set(dividends.map(d => d.assetName))).sort();

    // Filter dividends
    const filteredDividends = dividends.filter(dividend => {
        const matchesSearch = dividend.assetName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesAsset = !filterAsset || dividend.assetName === filterAsset;
        const matchesDateFrom = !dateFrom || new Date(dividend.date) >= new Date(dateFrom);
        const matchesDateTo = !dateTo || new Date(dividend.date) <= new Date(dateTo);

        return matchesSearch && matchesAsset && matchesDateFrom && matchesDateTo;
    });

    // Calculate total of filtered dividends
    const totalFiltered = filteredDividends.reduce((acc, d) => acc + d.value, 0);

    // Export to PDF
    const handleExportPDF = () => {
        // Create a simple HTML content for PDF
        const content = `
            <html>
                <head>
                    <title>Relatório de Dividendos</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h1 { color: #8c2bee; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { background-color: #8c2bee; color: white; padding: 10px; text-align: left; }
                        td { border: 1px solid #ddd; padding: 8px; }
                        tr:nth-child(even) { background-color: #f2f2f2; }
                        .total { margin-top: 20px; font-size: 18px; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <h1>Relatório de Dividendos</h1>
                    <p><strong>Data de geração:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
                    ${filterAsset ? `<p><strong>Ativo:</strong> ${filterAsset}</p>` : ''}
                    ${dateFrom ? `<p><strong>Período:</strong> ${new Date(dateFrom).toLocaleDateString('pt-BR')} a ${dateTo ? new Date(dateTo).toLocaleDateString('pt-BR') : 'Hoje'}</p>` : ''}
                    <table>
                        <thead>
                            <tr>
                                <th>Ativo</th>
                                <th>Data</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredDividends.map(d => `
                                <tr>
                                    <td>${d.assetName}</td>
                                    <td>${new Date(d.date).toLocaleDateString('pt-BR')}</td>
                                    <td>R$ ${d.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="total">
                        <p>Total de Dividendos: R$ ${totalFiltered.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                        <p>Quantidade de registros: ${filteredDividends.length}</p>
                    </div>
                </body>
            </html>
        `;

        // Create a new window and print
        const printWindow = window.open('', '', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write(content);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    };

    // Clear filters
    const handleClearFilters = () => {
        setSearchTerm('');
        setFilterAsset('');
        setDateFrom('');
        setDateTo('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Todos os Dividendos
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Total: R$ {totalFiltered.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({filteredDividends.length} registros)
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                    >
                        <span className="material-symbols-outlined text-3xl">close</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Buscar
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Nome do ativo..."
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Filter by Asset */}
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Ativo
                            </label>
                            <select
                                value={filterAsset}
                                onChange={(e) => setFilterAsset(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="">Todos os ativos</option>
                                {uniqueAssets.map(asset => (
                                    <option key={asset} value={asset}>{asset}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date From */}
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Data Inicial
                            </label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>

                        {/* Date To */}
                        <div>
                            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Data Final
                            </label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                        <button
                            onClick={handleClearFilters}
                            className="px-4 py-2 text-sm bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                        >
                            Limpar Filtros
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined !text-lg">picture_as_pdf</span>
                            Exportar PDF
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto p-6">
                    {filteredDividends.length > 0 ? (
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-700">
                                <tr className="text-slate-500 uppercase text-xs tracking-wider">
                                    <th className="px-4 py-3">Ativo</th>
                                    <th className="px-4 py-3">Data</th>
                                    <th className="px-4 py-3 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filteredDividends.map((dividend) => (
                                    <tr key={dividend.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-4 py-3 text-sm font-bold text-slate-900 dark:text-white">
                                            {dividend.assetName}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-500">
                                            {new Date(dividend.date).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                                            R$ {dividend.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-600">search_off</span>
                            <p className="text-slate-500 mt-4">Nenhum dividendo encontrado com os filtros aplicados</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewAllDividendsModal;
