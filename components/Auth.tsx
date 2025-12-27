import React, { useState } from 'react';
import { supabase } from '../services/supabase';

interface AuthProps {
    onSession: (session: any) => void;
    showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
    onBack?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onSession, showToast, onBack }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [isResetMode, setIsResetMode] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [birthDate, setBirthDate] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGoogleAuth = async () => {
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) throw error;
        } catch (err: any) {
            setError(err.message || 'Erro ao conectar com Google.');
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin,
            });
            if (error) throw error;
            showToast('Email de recuperação enviado!', 'success');
            setIsResetMode(false);
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar email de recuperação.');
        } finally {
            setLoading(false);
        }
    };

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
                const fullName = `${firstName} ${lastName}`.trim();

                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName,
                            birth_date: birthDate,
                        }
                    }
                });

                if (error) throw error;

                // Attempt to update profile immediately if user is returned (sometimes session is created immediately if auto-confirm is on)
                if (data.user) {
                    await supabase.from('profiles').upsert({
                        id: data.user.id,
                        name: fullName,
                        birthDate: birthDate,
                        email: email,
                    }, { onConflict: 'id' });
                }

                showToast('Cadastro realizado com sucesso! Verifique seu e-mail.', 'success');
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message || 'Ocorreu um erro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background-light dark:bg-background-dark p-4 relative overflow-y-auto">
            {/* Abstract Background Shapes */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px]"></div>

            {onBack && (
                <button
                    onClick={onBack}
                    className="absolute top-8 left-8 z-20 flex items-center gap-2 text-text-secondary dark:text-slate-400 hover:text-primary transition-colors font-medium bg-white/50 dark:bg-black/20 backdrop-blur-md px-4 py-2 rounded-full"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    Voltar
                </button>
            )}

            <div className="w-full max-w-md z-10 transition-all duration-300">
                <div className="bg-white/80 dark:bg-surface-dark/80 backdrop-blur-xl border border-white/20 dark:border-white/5 p-8 rounded-3xl shadow-2xl relative">

                    <div className="flex flex-col items-center mb-6">
                        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-primary/30 transform transition-transform hover:scale-105">
                            <span className="material-symbols-outlined text-white text-3xl">account_balance_wallet</span>
                        </div>
                        <h1 className="text-3xl font-extrabold text-text-main dark:text-white mb-2 tracking-tight">GranaUp</h1>
                        <p className="text-text-secondary dark:text-slate-400 text-center text-sm">
                            {isResetMode ? 'Recupere sua senha' : (isLogin ? 'Bem-vindo de volta' : 'Crie sua conta gratuitamente')}
                        </p>
                    </div>

                    <form onSubmit={isResetMode ? handleResetPassword : handleAuth} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-xs text-center font-medium animate-shake">
                                {error}
                            </div>
                        )}

                        {!isLogin && !isResetMode && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-text-main dark:text-slate-300 mb-1.5 ml-1 uppercase tracking-wide">Nome</label>
                                    <div className="relative group">
                                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors text-lg">person</span>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Nome"
                                            className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-text-main dark:text-white placeholder:text-slate-400 transition-all outline-none"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-text-main dark:text-slate-300 mb-1.5 ml-1 uppercase tracking-wide">Sobrenome</label>
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Sobrenome"
                                            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-text-main dark:text-white placeholder:text-slate-400 transition-all outline-none"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isLogin && !isResetMode && (
                            <div>
                                <label className="block text-xs font-bold text-text-main dark:text-slate-300 mb-1.5 ml-1 uppercase tracking-wide">Data de Nascimento</label>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">calendar_today</span>
                                    <input
                                        type="date"
                                        required
                                        className={`w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none ${birthDate ? 'text-text-main dark:text-white' : 'text-slate-400'}`}
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-text-main dark:text-slate-300 mb-1.5 ml-1 uppercase tracking-wide">E-mail</label>
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">mail</span>
                                <input
                                    type="email"
                                    required
                                    placeholder="seu@email.com"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-text-main dark:text-white placeholder:text-slate-400 transition-all outline-none"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {!isResetMode && (
                            <div>
                                <div className="flex justify-between items-center mb-1.5 ml-1">
                                    <label className="block text-xs font-bold text-text-main dark:text-slate-300 uppercase tracking-wide">Senha</label>
                                </div>
                                <div className="relative group">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">lock</span>
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-primary/50 focus:border-primary text-text-main dark:text-white placeholder:text-slate-400 transition-all outline-none"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-primary hover:bg-primary-dark text-white font-bold rounded-2xl shadow-lg shadow-primary/25 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>{isResetMode ? 'Enviar Email de Recuperação' : (isLogin ? 'Entrar' : 'Criar Conta')}</span>
                                    {!isResetMode && <span className="material-symbols-outlined text-xl">arrow_forward</span>}
                                </>
                            )}
                        </button>

                        {!isResetMode && isLogin && (
                            <div className="text-center mt-2">
                                <button
                                    type="button"
                                    onClick={() => { setIsResetMode(true); setError(null); }}
                                    className="text-xs text-slate-500 hover:text-primary font-medium transition-colors"
                                >
                                    Esqueceu sua senha?
                                </button>
                            </div>
                        )}
                    </form>

                    {!isResetMode && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-surface-dark px-2 text-slate-400 font-medium">Ou entre com</span>
                                </div>
                            </div>

                            <button
                                onClick={handleGoogleAuth}
                                disabled={loading}
                                className="w-full py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-3 group active:scale-[0.98]"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span>Google</span>
                            </button>
                        </>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                        {isResetMode ? (
                            <button
                                onClick={() => { setIsResetMode(false); setError(null); }}
                                className="text-slate-500 hover:text-slate-800 dark:hover:text-white text-sm font-medium flex items-center justify-center gap-2 mx-auto"
                            >
                                <span className="material-symbols-outlined text-lg">arrow_back</span>
                                Voltar para o login
                            </button>
                        ) : (
                            <p className="text-text-secondary dark:text-slate-400 text-sm">
                                {isLogin ? 'Não tem uma conta?' : 'Já possui uma conta?'}
                                <button
                                    onClick={() => { setIsLogin(!isLogin); setError(null); }}
                                    className="ml-2 text-primary font-bold hover:underline transition-all"
                                >
                                    {isLogin ? 'Cadastre-se' : 'Faça Login'}
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Auth;
