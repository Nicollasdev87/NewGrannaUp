import React, { useState } from 'react';
import Footer from './Footer';

interface LandingPageProps {
    onNavigateToAuth: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth }) => {
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);

    // Mocked data based on the request and images
    const features = [
        {
            icon: 'chat',
            title: 'Integração WhatsApp',
            description: 'Registre suas transações enviando uma simples mensagem. Rápido, prático e sem precisar abrir o app.'
        },
        {
            icon: 'dashboard',
            title: 'Dashboard Inteligente',
            description: 'Visualize seus gastos, receitas e investimentos com gráficos interativos e insights personalizados.'
        },
        {
            icon: 'show_chart', // Use a valid icon
            title: 'Gestão de Investimentos',
            description: 'Acompanhe sua carteira de investimentos em um só lugar. Ações, fundos, cripto e muito mais.'
        },
        {
            icon: 'track_changes', // Use a valid icon
            title: 'Metas e Objetivos',
            description: 'Defina suas metas financeiras e acompanhe o progresso. Visualize quanto falta para realizar seus sonhos.'
        },
        {
            icon: 'attach_money',
            title: 'Controle de Gastos',
            description: 'Categorize automaticamente suas despesas e descubra para onde seu dinheiro está indo.'
        },
        {
            icon: 'devices',
            title: 'Acesso em Qualquer Lugar',
            description: 'Totalmente responsivo. Acesse pelo computador, tablet ou celular quando e onde quiser.'
        }
    ];

    const steps = [
        { number: 1, title: 'Crie sua conta', description: 'Cadastre-se gratuitamente em menos de 1 minuto usando seu email ou conta Google.' },
        { number: 2, title: 'Conecte o WhatsApp', description: 'Vincule seu número de WhatsApp e comece a registrar transações por mensagem.' },
        { number: 3, title: 'Acompanhe tudo', description: 'Visualize seus gastos, investimentos e metas no dashboard completo.' }
    ];

    const pricing = [
        {
            name: 'Gratuito',
            description: 'Para começar a organizar suas finanças',
            price: 'R$ 0',
            period: '/mês',
            features: ['50 transações/mês', 'Dashboard básico', '3 metas financeiras', 'WhatsApp limitado'],
            buttonDetails: 'Começar Grátis',
            recommended: false
        },
        {
            name: 'Pro',
            description: 'Para quem leva finanças a sério',
            price: 'R$ 19',
            period: '/mês',
            features: ['Transações ilimitadas', 'Dashboard completo', 'Metas ilimitadas', 'WhatsApp ilimitado', 'Gestão de investimentos', 'Relatórios avançados'],
            buttonDetails: 'Assinar Pro',
            recommended: true
        },
        {
            name: 'Business',
            description: 'Para famílias e pequenos negócios',
            price: 'R$ 49',
            period: '/mês',
            features: ['Tudo do Pro', 'Até 5 usuários', 'Contas compartilhadas', 'Suporte prioritário', 'API de integração', 'Fale com Vendas'],
            buttonDetails: 'Fale com Vendas',
            recommended: false
        }
    ];

    const testimonials = [
        {
            text: "A integração com WhatsApp mudou minha vida! Agora eu realmente anoto todos os meus gastos sem esforço.",
            author: "Maria Silva",
            role: "Designer",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150"
        },
        {
            text: "Finalmente consegui juntar dinheiro para minha viagem! O acompanhamento de metas é incrível.",
            author: "João Santos",
            role: "Desenvolvedor",
            avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150&h=150"
        },
        {
            text: "O dashboard de investimentos me ajuda a tomar decisões mais inteligentes. Recomendo muito!",
            author: "Ana Oliveira",
            role: "Empresária",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150&h=150"
        }
    ];

    return (
        <div className="h-screen w-full bg-white dark:bg-slate-900 font-sans text-slate-900 dark:text-white overflow-y-scroll snap-y snap-mandatory scroll-smooth">

            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">G</div>
                            <span className="font-bold text-xl tracking-tight">GranaUp</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
                            <a href="#recursos" className="hover:text-primary transition-colors">Recursos</a>
                            <a href="#como-funciona" className="hover:text-primary transition-colors">Como Funciona</a>
                            <a href="#planos" className="hover:text-primary transition-colors">Planos</a>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onNavigateToAuth}
                                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
                            >
                                Entrar
                            </button>
                            <button
                                onClick={onNavigateToAuth}
                                className="px-5 py-2.5 bg-primary text-white rounded-full text-sm font-bold hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                            >
                                Começar Grátis
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="min-h-screen snap-start pt-32 pb-20 md:pt-40 md:pb-32 px-4 max-w-7xl mx-auto flex items-center">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8 animate-in slide-in-from-left duration-700">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Integração com WhatsApp
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.1]">
                            Sua vida financeira <span className="text-primary">simplificada</span> e no controle
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
                            Gerencie suas finanças e investimentos de forma inteligente. Adicione transações pelo WhatsApp e acompanhe tudo em tempo real.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={onNavigateToAuth}
                                className="px-8 py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-dark transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                Começar Agora
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </button>
                            <button className="px-8 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-green-500">chat</span>
                                Ver Demo WhatsApp
                            </button>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-slate-500 font-medium pt-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">check</span>
                                Grátis para começar
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">check</span>
                                Sem cartão de crédito
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 w-full relative animate-in slide-in-from-right duration-700 delay-200">
                        <div className="relative aspect-video bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800 group cursor-pointer">
                            {/* Placeholder content for the black square */}
                            <img
                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800&h=600"
                                className="w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity"
                                alt="Dashboard Preview"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-white text-4xl">play_row</span>
                                </div>
                            </div>

                            {/* Floating Whatsapp Badge */}
                            {/* Floating Whatsapp Badge - Redesigned */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[80%]">
                                <div className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/20 animate-in fade-in zoom-in duration-700 delay-500">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg">
                                                <span className="material-symbols-outlined text-2xl">chat</span>
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                                                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h4 className="font-bold text-white text-sm">Notificação WhatsApp</h4>
                                                <span className="text-[10px] text-white/60">Agora</span>
                                            </div>
                                            <p className="text-sm font-medium text-white/90 truncate">
                                                ✅ Despesa registrada: <span className="font-bold text-white">R$ 50,00</span> (Almoço)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="min-h-screen snap-start border-y border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 py-12 flex items-center">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { label: 'Usuários Ativos', value: '50K+' },
                        { label: 'Gerenciados', value: 'R$ 2M+' },
                        { label: 'Transações', value: '1M+' },
                        { label: 'Avaliação', value: '4.9' }
                    ].map((stat, i) => (
                        <div key={i}>
                            <div className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-1">{stat.value}</div>
                            <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Grid */}
            <section id="recursos" className="min-h-screen snap-start py-24 max-w-7xl mx-auto px-4 text-center flex flex-col justify-center">
                <div className="mb-16 max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Tudo que você precisa para organizar suas finanças</h2>
                    <p className="text-lg text-slate-600 dark:text-slate-400">Ferramentas poderosas e fáceis de usar para controlar seus gastos, investimentos e alcançar seus objetivos financeiros.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all text-left group">
                            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-2xl">{feature.icon}</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Steps Section */}
            <section id="como-funciona" className="min-h-screen snap-start py-24 bg-slate-50 dark:bg-slate-800/50 flex items-center">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Comece em 3 passos simples</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">É muito fácil começar a controlar suas finanças com o GranaUp.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connector Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-slate-200 dark:bg-slate-700 -z-10"></div>

                        {steps.map((step, i) => (
                            <div key={i} className="text-center relative">
                                <div className="w-24 h-24 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-xl border-4 border-slate-50 dark:border-slate-800">
                                    {step.number}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Highlight (WhatsApp) */}
            <section className="min-h-screen snap-start py-24 max-w-7xl mx-auto px-4 flex items-center">
                <div className="flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 w-full order-2 md:order-1">
                        <div className="relative aspect-square bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800">
                            <img
                                src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800&h=800"
                                alt="WhatsApp Integration"
                                className="w-full h-full object-cover opacity-60"
                            />
                            <div className="absolute bottom-8 left-8 right-8 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10">
                                <div className="flex gap-4 items-start">
                                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shrink-0">
                                        <span className="material-symbols-outlined">chat</span>
                                    </div>
                                    <div className="flex-1">
                                        <div className="bg-white/90 p-3 rounded-2xl rounded-tl-none text-slate-800 text-sm mb-2 shadow-sm">
                                            Gastei R$ 30 no mercado
                                        </div>
                                        <div className="bg-primary p-3 rounded-2xl rounded-tr-none text-white text-sm shadow-sm ml-auto w-fit">
                                            Anotado! R$ 30,00 adicionado em Alimentação.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 order-1 md:order-2 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm">whatsapp</span>
                            Exclusivo GranaUp
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold">Registre gastos pelo <span className="text-[#25D366]">WhatsApp</span></h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                            Chega de esquecer de anotar seus gastos! Com a integração do WhatsApp, basta enviar uma mensagem simples como "Gastei R$ 30 no mercado" e pronto, está registrado.
                        </p>
                        <ul className="space-y-4 pt-4">
                            {[
                                'Linguagem natural - escreva como você fala',
                                'Categorização automática com IA',
                                'Confirmação instantânea da transação',
                                'Consulte seu saldo e extrato pelo chat'
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                                    <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 shrink-0">
                                        <span className="material-symbols-outlined text-sm">check</span>
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="planos" className="min-h-screen snap-start py-24 bg-slate-50 dark:bg-slate-800/50 flex items-center">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Planos para todos os bolsos</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">Escolha o plano ideal para suas necessidades. Comece grátis e faça upgrade quando quiser.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                        {pricing.map((plan, i) => (
                            <div key={i} className={`bg - white dark: bg - slate - 900 p - 8 rounded - 3xl shadow - lg border ${plan.recommended ? 'border-primary ring-2 ring-primary ring-offset-4 dark:ring-offset-slate-900 relative' : 'border-slate-100 dark:border-slate-700'} `}>
                                {plan.recommended && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold uppercase px-3 py-1 rounded-full shadow-lg">
                                        Mais Popular
                                    </div>
                                )}
                                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                <p className="text-slate-500 text-sm mb-6 h-10">{plan.description}</p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-extrabold">{plan.price}</span>
                                    <span className="text-slate-500">{plan.period}</span>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feat, idx) => (
                                        <li key={idx} className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                                            <span className="material-symbols-outlined text-primary text-[18px]">check</span>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={onNavigateToAuth}
                                    className={`w - full py - 3 rounded - xl font - bold text - sm transition - all ${plan.recommended ? 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/25' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'} `}
                                >
                                    {plan.buttonDetails}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="min-h-screen snap-start py-24 max-w-7xl mx-auto px-4 bg-white dark:bg-slate-900 flex flex-col justify-center">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">O que nossos usuários dizem</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((test, i) => (
                        <div key={i} className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 relative">
                            <div className="text-yellow-400 flex gap-1 mb-6 text-sm">
                                {[1, 2, 3, 4, 5].map(star => <span key={star} className="material-symbols-outlined fill-current">star</span>)}
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 italic mb-8 relative z-10">"{test.text}"</p>
                            <div className="flex items-center gap-4">
                                <img src={test.avatar} alt={test.author} className="w-12 h-12 rounded-full object-cover" />
                                <div>
                                    <div className="font-bold text-slate-900 dark:text-white">{test.author}</div>
                                    <div className="text-xs text-slate-500">{test.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Footer */}
            <section className="min-h-screen snap-start py-24 bg-slate-900 text-white relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[200%] bg-primary/20 blur-[150px] rounded-full"></div>

                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Pronto para transformar suas finanças?</h2>
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
                        Junte-se a milhares de pessoas que já estão no controle de suas finanças com o GranaUp.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={onNavigateToAuth}
                            className="px-8 py-4 bg-white text-slate-900 rounded-xl font-bold text-lg hover:bg-slate-100 transition-colors"
                        >
                            Criar Conta Gratuita
                            <span className="material-symbols-outlined align-bottom ml-2">arrow_forward</span>
                        </button>
                        <button className="px-8 py-4 bg-transparent border border-slate-700 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-colors">
                            Agendar Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer Links */}
            {/* Footer Links */}
            <footer className="py-16 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-sm">
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
        </div>
    );
};

export default LandingPage;
