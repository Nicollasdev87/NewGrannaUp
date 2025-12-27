import React, { useState, useRef } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../services/supabase';

interface ProfileProps {
  user: UserProfile;
  onSave: (user: UserProfile) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onSave, showToast, setHasUnsavedChanges }) => {
  const [formData, setFormData] = useState<UserProfile>(user);

  // Track unsaved changes
  React.useEffect(() => {
    const isDirty = JSON.stringify(formData) !== JSON.stringify(user);
    setHasUnsavedChanges(isDirty);
  }, [formData, user, setHasUnsavedChanges]);

  const [activeTab, setActiveTab] = useState<'personal' | 'security'>('personal');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}/${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const updatedProfile = { ...formData, avatar: publicUrl };
      setFormData(updatedProfile);

      // Persist immediately to database
      onSave(updatedProfile);

      showToast('Foto atualizada com sucesso!', 'success');
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      showToast('Erro ao carregar imagem', 'error');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('As senhas não coincidem', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('A senha deve ter pelo menos 6 caracteres', 'error');
      return;
    }

    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      showToast('Senha alterada com sucesso!', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      showToast('Erro ao alterar senha: ' + error.message, 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 mt-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary uppercase tracking-wider mb-2">Meu Perfil</h2>
          <p className="text-slate-500 text-sm mt-1">Gerencie suas informações pessoais e segurança.</p>
        </div>
        {activeTab === 'personal' && (
          <div className="flex gap-3">
            <button
              onClick={() => setFormData(user)}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-bold hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => onSave(formData)}
              className="px-6 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-dark shadow-md shadow-primary/20 transition-all"
            >
              Salvar Alterações
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <aside className="md:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
              <div
                className="relative group cursor-pointer mb-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <div
                  className="w-24 h-24 rounded-full bg-cover bg-center ring-4 ring-white dark:ring-slate-700 shadow-lg relative flex items-center justify-center overflow-hidden"
                  style={{ backgroundImage: !avatarLoading ? `url('${formData.avatar}')` : 'none' }}
                >
                  {avatarLoading && (
                    <div className="absolute inset-0 bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                      <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="material-symbols-outlined text-white text-lg">photo_camera</span>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </div>
              <h3 className="text-lg font-bold truncate max-w-full">{formData.name}</h3>
              <p className="text-xs text-slate-500 font-medium truncate max-w-full">{formData.email}</p>
            </div>
            <nav className="p-2 space-y-1">
              <button
                onClick={() => setActiveTab('personal')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-colors ${activeTab === 'personal' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'}`}
              >
                <span className="material-symbols-outlined">person</span> Dados Pessoais
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-sm transition-colors ${activeTab === 'security' ? 'bg-primary/10 text-primary' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-700'}`}
              >
                <span className="material-symbols-outlined">lock</span> Segurança
              </button>
            </nav>
          </div>
        </aside>

        <div className="md:col-span-2 space-y-6">
          {activeTab === 'personal' ? (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 animate-in fade-in duration-300">
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
                      disabled
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 cursor-not-allowed outline-none"
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
                      placeholder="(00) 00000-0000"
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
                      value={formData.birthDate || ''}
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
                    value={formData.occupation || ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none resize-none"
                    placeholder="Conte um pouco sobre você..."
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 animate-in fade-in duration-300">
              <h3 className="text-lg font-bold mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">Segurança da Conta</h3>
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-slate-700 dark:text-slate-300 text-sm font-bold">Nova Senha</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-lg">lock</span>
                      <input
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-slate-700 dark:text-slate-300 text-sm font-bold">Confirmar Senha</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 material-symbols-outlined text-lg">lock</span>
                      <input
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                        type="password"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordLoading || !newPassword}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {passwordLoading ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin"></span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">key</span>
                    )}
                    Alterar Senha
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
