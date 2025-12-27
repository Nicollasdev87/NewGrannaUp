
import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';

// Set worker path for pdfjs
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs`;

interface ImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (transactions: any[]) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport, showToast }) => {
    const [step, setStep] = useState<1 | 2>(1);
    const [importType, setImportType] = useState<'excel' | 'pdf' | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleTypeSelect = (type: 'excel' | 'pdf') => {
        setImportType(type);
        setStep(2);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleReset = () => {
        setStep(1);
        setImportType(null);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const processFile = async () => {
        if (!selectedFile || !importType) return;

        setIsLoading(true);
        try {
            if (importType === 'excel') {
                await processExcel(selectedFile);
            } else {
                await processPDF(selectedFile);
            }
        } catch (error) {
            console.error('Error processing file:', error);
            showToast('Erro ao processar arquivo', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const processExcel = async (file: File) => {
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            const imported = data.map((row: any) => ({
                description: row.Descricao || row.Descrição || row.description || 'Importado (Excel)',
                value: Math.abs(Number(row.Valor || row.Value || 0)),
                type: (row.Tipo || row.type || '').toLowerCase().includes('receita') ? 'income' : 'expense',
                category: row.Categoria || row.category || 'Outros',
                date: row.Data || row.date || new Date().toISOString().split('T')[0],
                icon: (row.Tipo || row.type || '').toLowerCase().includes('receita') ? 'trending_up' : 'payments'
            }));

            onImport(imported);
            onClose();
            handleReset();
        };
        reader.readAsBinaryString(file);
    };

    const processPDF = async (file: File) => {
        const arrayBuffer = await file.arrayBuffer();
        try {
            const pdf = await getDocument(arrayBuffer).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                // Join text items with spaces, preserving some line structure
                fullText += textContent.items.map((item: any) => (item as any).str).join(' ') + '\n';
            }

            console.log('PDF Extracted Text:', fullText);

            const imported: any[] = [];
            // Patterns for Brazilian financial documents
            const dateRegex = /(\d{2}\/\d{2}(\/\d{2,4})?)/g;
            const amountRegex = /(?:R\$?\s?)?(-?\d{1,3}(?:\.\d{3})*(?:,\d{2}))/g;

            // Split by lines to keep context
            const lines = fullText.split('\n');

            lines.forEach(line => {
                const dates = line.match(dateRegex);
                const amounts = line.match(amountRegex);

                if (dates && amounts) {
                    // Extract the first date and all amounts in the same line
                    const dateStr = dates[0];
                    amounts.forEach(amtStr => {
                        // Clean amount string: remove R$, spaces, replace dot with nothing and comma with dot
                        const cleanAmt = amtStr.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.');
                        const value = Math.abs(parseFloat(cleanAmt));

                        if (!isNaN(value) && value > 0) {
                            // Try to determine type (if it starts with - it's an expense, but many statements don't use -)
                            // For now, let's keep it as expense by default unless it's a very clear income pattern
                            const type = amtStr.includes('-') ? 'expense' : 'expense';

                            imported.push({
                                description: line.trim().substring(0, 50) || 'Importado (PDF)',
                                value: value,
                                type: type,
                                category: 'Importado',
                                date: convertToISODate(dateStr),
                                icon: 'account_balance_wallet'
                            });
                        }
                    });
                }
            });

            if (imported.length > 0) {
                console.log('Imported Items:', imported);
                onImport(imported);
                showToast(`${imported.length} lançamentos encontrados no PDF`, 'success');
                onClose();
                handleReset();
            } else {
                showToast('Não foi possível encontrar transações claras (Data + Valor) no PDF', 'error');
            }
        } catch (error) {
            console.error('PDF Worker Error:', error);
            showToast('Erro ao carregar o motor de PDF. Tente novamente.', 'error');
        }
    };

    const convertToISODate = (dateStr: string) => {
        const parts = dateStr.split('/');
        const day = parts[0];
        const month = parts[1];
        let year = parts[2] || new Date().getFullYear().toString();

        if (year.length === 2) year = '20' + year;

        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Importar Lançamentos</h3>
                        <p className="text-xs text-slate-500 mt-1">Escolha uma opção para começar</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <span className="material-symbols-outlined text-slate-400">close</span>
                    </button>
                </div>

                <div className="p-8">
                    {step === 1 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => handleTypeSelect('excel')}
                                className="group p-6 border-2 border-slate-100 dark:border-slate-700 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left flex flex-col gap-4"
                            >
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined !text-3xl">table_chart</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Excel / CSV</h4>
                                    <p className="text-xs text-slate-500 mt-1">Planilhas (.xls, .xlsx, .csv)</p>
                                </div>
                            </button>

                            <button
                                onClick={() => handleTypeSelect('pdf')}
                                className="group p-6 border-2 border-slate-100 dark:border-slate-700 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left flex flex-col gap-4"
                            >
                                <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined !text-3xl">picture_as_pdf</span>
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">Extrato PDF</h4>
                                    <p className="text-xs text-slate-500 mt-1">Arquivos digitais de bancos</p>
                                </div>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center hover:border-primary/50 hover:bg-primary/5 cursor-pointer transition-all"
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept={importType === 'excel' ? '.xls,.xlsx,.csv' : '.pdf'}
                                    className="hidden"
                                />
                                <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined !text-3xl">cloud_upload</span>
                                </div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {selectedFile ? selectedFile.name : 'Clique para selecionar o arquivo'}
                                </p>
                                <p className="text-xs text-slate-500 mt-2">
                                    {importType === 'excel' ? 'Formatos aceitos: .xls, .xlsx, .csv' : 'Apenas arquivos .pdf'}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handleReset}
                                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
                                >
                                    Voltar
                                </button>
                                <button
                                    onClick={processFile}
                                    disabled={!selectedFile || isLoading}
                                    className="flex-[2] px-4 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                            Processando...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-symbols-outlined !text-[18px]">rocket_launch</span>
                                            Carregar Transações
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImportModal;
