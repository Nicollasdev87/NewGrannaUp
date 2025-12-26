
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface ProfileProps {
  user: UserProfile;
  onSave: (user: UserProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onSave }) => {
  const [formData, setFormData] = useState<UserProfile>(user);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 mt-24">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary uppercase tracking-wider mb-2">Meu Perfil</h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie suas informações pessoais e visibilidade.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold hover:bg-slate-50 transition-colors">Cancelar</button>
          <button
            onClick={() => onSave(formData)}
            className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark shadow-md shadow-primary/20 transition-all"
          >
            Salvar Alterações
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <aside className="md:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
              <div className="relative group cursor-pointer mb-4">
                <div
                  className="w-24 h-24 rounded-full bg-cover bg-center ring-4 ring-white dark:ring-slate-700 shadow-lg"
                  style={{ backgroundImage: `url('${formData.avatar}')` }}
                />
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white text-lg">edit</span>
                </div>
              </div>
              <h3 className="text-lg font-bold">{formData.name}</h3>
              <p className="text-xs text-slate-500 font-medium">Membro desde 2023</p>
            </div>
            <nav className="p-2 space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-primary/10 text-primary font-bold text-sm">
                <span className="material-symbols-outlined">person</span> Dados Pessoais
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700 text-sm">
                <span className="material-symbols-outlined">lock</span> Segurança
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700 text-sm">
                <span className="material-symbols-outlined">notifications</span> Notificações
              </button>
            </nav>
          </div>
        </aside>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">Informações Pessoais</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-bold">Nome Completo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-lg">person</span>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    type="text"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-bold">Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-lg">mail</span>
                  <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    type="email"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-bold">Telefone</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-lg">call</span>
                  <input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    type="tel"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-bold">Nascimento</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-lg">cake</span>
                  <input
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                    type="date"
                  />
                </div>
              </div>
              <div className="sm:col-span-2 flex flex-col gap-2">
                <label className="text-slate-700 dark:text-slate-300 text-sm font-bold">Ocupação / Bio</label>
                <textarea
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"
                  placeholder="Conte um pouco sobre você..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">Aparência</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">Modo Escuro</p>
                <p className="text-xs text-slate-500">Alterar entre tema claro e escuro</p>
              </div>
              <button
                onClick={() => document.documentElement.classList.toggle('dark')}
                className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg"
              >
                <span className="material-symbols-outlined">contrast</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
