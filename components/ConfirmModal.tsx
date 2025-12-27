import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel?: () => void;
    variant?: 'danger' | 'warning' | 'info' | 'success';
    type?: 'confirm' | 'alert';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'OK',
    cancelText = 'Cancelar',
    onConfirm,
    onCancel,
    variant = 'danger',
    type = 'confirm'
}) => {
    if (!isOpen) return null;

    // Set default confirm text based on type if not provided
    const finalConfirmText = confirmText === 'OK' && type === 'confirm' ? 'Sim' : confirmText;

    const variantColors = {
        danger: {
            icon: 'delete',
            iconBg: 'bg-red-100 dark:bg-red-900/30',
            iconColor: 'text-red-600 dark:text-red-400',
            confirmBtn: 'bg-red-500 hover:bg-red-600 text-white'
        },
        warning: {
            icon: 'warning',
            iconBg: 'bg-amber-100 dark:bg-amber-900/30',
            iconColor: 'text-amber-600 dark:text-amber-400',
            confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-white'
        },
        info: {
            icon: 'info',
            iconBg: 'bg-blue-100 dark:bg-blue-900/30',
            iconColor: 'text-blue-600 dark:text-blue-400',
            confirmBtn: 'bg-primary hover:bg-primary-dark text-white'
        },
        success: {
            icon: 'check_circle',
            iconBg: 'bg-green-100 dark:bg-green-900/30',
            iconColor: 'text-green-600 dark:text-green-400',
            confirmBtn: 'bg-green-500 hover:bg-green-600 text-white'
        }
    };

    const colors = variantColors[variant];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-300">
                <div className="p-6 text-center">
                    {/* Icon */}
                    <div className={`w-16 h-16 mx-auto rounded-full ${colors.iconBg} flex items-center justify-center mb-4`}>
                        <span className={`material-symbols-outlined !text-[32px] ${colors.iconColor}`}>
                            {colors.icon}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-slate-600 dark:text-slate-400 mb-6 whitespace-pre-wrap">
                        {message}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        {type === 'confirm' && (
                            <button
                                onClick={onCancel}
                                className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                            >
                                {cancelText}
                            </button>
                        )}
                        <button
                            onClick={onConfirm}
                            className={`${type === 'confirm' ? 'flex-1' : 'w-full'} py-3 px-4 rounded-xl font-semibold transition-all shadow-lg ${colors.confirmBtn}`}
                        >
                            {finalConfirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
