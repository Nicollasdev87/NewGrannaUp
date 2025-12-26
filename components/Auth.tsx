import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface AuthProps {
    onSession: (session: any) => void;
}

const Auth: React.FC<AuthProps> = ({ onSession }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                if (data.session) onSession(data.session);
            } else {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                alert('Verifique seu e-mail para confirmar o cadastro!');
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark p-4 relative overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px]"></div>

            <div className="w-full max-w-md z-10">
                <div className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border border-white/20 dark:border-white/5 p-8 rounded-3xl shadow-2xl relative">

                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                            <span className="material-symbols-outlined text-white text-3xl">account_balance_wallet</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-text-main dark:text-white mb-2">Granaup</h1>
                        <p className="text-text-secondary dark:text-slate-400 text-center">
                            {isLogin ? 'Bem-vindo de volta ao seu controle financeiro.' : 'Comece sua jornada para a liberdade financeira.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-text-main dark:text-slate-300 mb-2 ml-1">E-mail</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">mail</span>
                                <input
                                    type="email"
                                    required
                                    placeholder="exemplo@email.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-background-light dark:bg-background-dark/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/50 text-text-main dark:text-white placeholder:text-text-secondary/50 transition-all outline-none"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-text-main dark:text-slate-300 mb-2 ml-1">Senha</label>
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary">lock</span>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-4 py-3.5 bg-background-light dark:bg-background-dark/50 border-none rounded-2xl focus:ring-2 focus:ring-primary/50 text-text-main dark:text-white placeholder:text-text-secondary/50 transition-all outline-none"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-primary hover:bg-primary-light text-white font-bold rounded-2xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>{isLogin ? 'Entrar' : 'Criar Conta'}</span>
                                    <span className="material-symbols-outlined text-xl">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-slate-200 dark:border-white/5 text-center">
                        <p className="text-text-secondary dark:text-slate-400">
                            {isLogin ? 'Não tem uma conta?' : 'Já possui uma conta?'}
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="ml-2 text-primary font-bold hover:underline"
                            >
                                {isLogin ? 'Cadastre-se' : 'Faça Login'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
