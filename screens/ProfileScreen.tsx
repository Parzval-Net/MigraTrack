
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { storeService } from '../storeService';
import { UserProfile } from '../types';

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [importStatus, setImportStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setProfile(storeService.getProfile());
  }, []);

  const handleExport = () => {
    const data = storeService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    a.download = `migracare-backup-${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storeService.importData(content);
      if (success) {
        setImportStatus('success');
        setProfile(storeService.getProfile());
        setTimeout(() => setImportStatus(''), 3000);
      } else {
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (window.confirm('⚠️ ¿ESTÁS SEGURO? \n\nEsto borrará TODOS tus registros y datos del dispositivo. Esta acción no se puede deshacer.')) {
      storeService.clearAllData();
      navigate('/');
      // Force reload to clear states
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark pb-20 font-display">
      <header className="flex items-center px-4 py-4 pt-6 bg-white dark:bg-surface-dark shadow-sm z-10">
        <h2 className="text-xl font-bold flex-1 text-slate-800 dark:text-white">Mi Perfil</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* User Card */}
        <div className="bg-gradient-to-br from-primary to-violet-600 rounded-3xl p-6 text-white shadow-xl shadow-primary/20">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
              <span className="material-symbols-outlined text-3xl text-white">person</span>
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">{profile?.name || 'Usuario'}</h3>
              <p className="text-white/80 text-sm font-medium">Gestiona tu salud y tus datos</p>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest px-2">Gestión de Datos</h4>

          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-white/5 p-2 shadow-sm">
            <button
              onClick={handleExport}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left group"
            >
              <div className="size-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">cloud_download</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 dark:text-slate-100">Crear Copia de Seguridad</p>
                <p className="text-xs text-slate-400 mt-0.5">Descarga tus datos en un archivo JSON</p>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>

            <div className="h-px bg-slate-50 dark:bg-white/5 mx-4 my-1"></div>

            <button
              onClick={handleImportClick}
              className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left group"
            >
              <div className="size-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">file_upload</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-800 dark:text-slate-100">Restaurar Datos</p>
                <p className="text-xs text-slate-400 mt-0.5">Carga una copia desde otro dispositivo</p>
              </div>
              <span className="material-symbols-outlined text-slate-300">chevron_right</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>

          {importStatus === 'success' && (
            <div className="bg-emerald-100 text-emerald-800 px-4 py-3 rounded-xl text-sm font-bold text-center animate-pulse">
              ¡Datos restaurados con éxito!
            </div>
          )}
          {importStatus === 'error' && (
            <div className="bg-red-100 text-red-800 px-4 py-3 rounded-xl text-sm font-bold text-center animate-pulse">
              Error al leer el archivo. Formato inválido.
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="pt-8">
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border-2 border-red-100 dark:border-red-900/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <span className="material-symbols-outlined">delete_forever</span>
            <span className="font-bold text-sm uppercase tracking-widest">Borrar todos los datos</span>
          </button>
          <p className="text-center text-[10px] text-slate-400 mt-3 px-8 leading-relaxed">
            Esta acción eliminará permanentemente todos tus registros de este dispositivo.
          </p>
        </div>

        <div className="text-center mt-8">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">MigraCare v1.0.0</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfileScreen;
