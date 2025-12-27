import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="py-16 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-sm relative z-50">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
                <div className="col-span-2 md:col-span-1 pr-8">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20">G</div>
                        <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">GranaUp</span>
                    </div>
                    <p className="text-slate-500 leading-relaxed dark:text-slate-400">
                        Sua plataforma completa para gestão financeira pessoal e investimentos. Simples, poderosa e conectada.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-wider">Produto</h4>
                    <ul className="space-y-3 text-slate-500 dark:text-slate-400 font-medium">
                        <li><a href="#" className="hover:text-primary transition-colors">Recursos</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Planos</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Integrações</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Updates</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-wider">Empresa</h4>
                    <ul className="space-y-3 text-slate-500 dark:text-slate-400 font-medium">
                        <li><a href="#" className="hover:text-primary transition-colors">Sobre nós</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Carreiras</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Contato</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-6 uppercase text-xs tracking-wider">Legal</h4>
                    <ul className="space-y-3 text-slate-500 dark:text-slate-400 font-medium">
                        <li><a href="#" className="hover:text-primary transition-colors">Privacidade</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Termos de Uso</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Segurança</a></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 pt-8 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400">
                <p className="text-xs font-medium">© 2025 GranaUp. Todos os direitos reservados.</p>
                <div className="flex gap-4">
                    {['public', 'chat_bubble', 'mail'].map((icon, i) => (
                        <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white transition-all transform hover:-translate-y-1 shadow-sm hover:shadow-lg">
                            <span className="material-symbols-outlined text-[20px]">{icon}</span>
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
