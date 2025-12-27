import React, { useEffect, useState } from 'react';

export interface ToastProps {
    id: string;
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: (id: string) => void;
    duration?: number;
}

const Toast: React.FC<ToastProps> = ({ id, message, type, onClose, duration = 4000 }) => {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const timer = setTimeout(() => {
            onClose(id);
        }, duration);

        const interval = setInterval(() => {
            setProgress((prev) => Math.max(0, prev - (100 / (duration / 10))));
        }, 10);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [id, duration, onClose]);

    const icons = {
        success: 'check_circle',
        error: 'error',
        info: 'info'
    };

    const colors = {
        success: 'border-emerald-500/50 bg-emerald-50/90 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
        error: 'border-red-500/50 bg-red-50/90 dark:bg-red-900/20 text-red-700 dark:text-red-300',
        info: 'border-blue-500/50 bg-blue-50/90 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
    };

    const progressColors = {
        success: 'bg-emerald-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };

    return (
        <div className={`
      relative group flex items-center gap-3 p-4 pr-10 rounded-2xl border backdrop-blur-md shadow-lg 
      animate-in slide-in-from-right-full duration-300 mb-3 min-w-[300px] max-w-md
      ${colors[type]}
    `}>
            <span className="material-symbols-outlined shrink-0 opacity-80">
                {icons[type]}
            </span>
            <p className="text-sm font-semibold">{message}</p>

            <button
                onClick={() => onClose(id)}
                className="absolute top-1/2 -translate-y-1/2 right-3 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
                <span className="material-symbols-outlined !text-[18px] opacity-40 group-hover:opacity-100 transition-opacity">
                    close
                </span>
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-2 left-4 right-4 h-1 bg-black/5 dark:bg-white/10 overflow-hidden rounded-full">
                <div
                    className={`h-full transition-all linear ${progressColors[type]}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export const ToastContainer: React.FC<{ toasts: ToastProps[], onClose: (id: string) => void }> = ({ toasts, onClose }) => {
    return (
        <div className="fixed top-6 right-6 z-[200] flex flex-col items-end pointer-events-none">
            <div className="pointer-events-auto">
                {toasts.map((toast) => (
                    <Toast key={toast.id} {...toast} onClose={onClose} />
                ))}
            </div>
        </div>
    );
};

export default Toast;
