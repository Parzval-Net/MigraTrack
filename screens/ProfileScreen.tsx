
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { storeService } from '../storeService';
import { UserProfile } from '../types';

const INITIAL_PROFILE: UserProfile = {
  name: '',
  age: undefined,
  migraineType: '',
  joinedDate: new Date().toISOString(),
  avatar: ''
};

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  // State
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [showClinical, setShowClinical] = useState(false);
  const [insights, setInsights] = useState<{ topSymptom: string, topMed: string, topLoc: string } | null>(null);
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [importStatus, setImportStatus] = useState<string>('');

  useEffect(() => {
    const stored = storeService.getProfile();
    if (stored) {
      setProfile(stored);
      setTempProfile(stored);
    }
    setInsights(storeService.getClinicalInsights());
  }, []);

  // Dark Mode Toggle
  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Profile Edits
  const handleSaveProfile = () => {
    storeService.saveProfile(tempProfile);
    setProfile(tempProfile);
    setIsEditing(false);
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setTempProfile(prev => ({ ...prev, avatar: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Backup & Restore
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
    importInputRef.current?.click();
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storeService.importData(content);
      if (success) {
        setImportStatus('success');
        const newProfile = storeService.getProfile();
        if (newProfile) {
          setProfile(newProfile);
          setTempProfile(newProfile);
        }
        setInsights(storeService.getClinicalInsights()); // Refresh insights too!
        setTimeout(() => setImportStatus(''), 3000);
      } else {
        setImportStatus('error');
      }
    };
    reader.readAsText(file);
  };

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?⚠️ Esto borrará los datos del dispositivo si no tienes copia.')) {
      storeService.clearAllData();
      navigate('/onboarding');
    }
  };

  return (
    <div className="flex flex-col h-full min-h-screen bg-background-light dark:bg-background-dark pb-24 font-display transition-colors">
      <header className="flex items-center px-4 py-4 pt-6 bg-white dark:bg-surface-dark shadow-sm z-10 sticky top-0">
        <h2 className="text-xl font-bold flex-1 text-slate-800 dark:text-white">Mi Perfil</h2>
        <button
          onClick={() => {
            if (isEditing) handleSaveProfile();
            else {
              setTempProfile(profile); // Reset temp to current
              setIsEditing(true);
            }
          }}
          className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${isEditing
              ? 'bg-primary text-white shadow-lg shadow-primary/30'
              : 'bg-slate-100 dark:bg-white/10 text-slate-500 hover:text-primary'
            }`}
        >
          {isEditing ? 'Guardar' : 'Editar'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {/* Profile Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-violet-600 rounded-3xl p-6 text-white shadow-xl shadow-primary/20 transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

          <div className="relative flex flex-col items-center text-center gap-4">
            <div className="relative group">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
              />
              <div
                onClick={handleAvatarClick}
                className={`size-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border-4 border-white/30 shadow-inner overflow-hidden ${isEditing ? 'cursor-pointer hover:border-white transition-colors' : ''}`}
              >
                {tempProfile.avatar || profile.avatar ? (
                  <img src={isEditing ? tempProfile.avatar : profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-5xl text-white">face_3</span>
                )}
              </div>
              {isEditing && (
                <div className="absolute inset-x-0 -bottom-2 flex justify-center pointer-events-none">
                  <div className="bg-black/50 backdrop-blur-md rounded-full px-2 py-0.5">
                    <span className="text-[10px] uppercase font-bold text-white/90">Cambiar</span>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full space-y-2">
              {isEditing ? (
                <input
                  type="text"
                  value={tempProfile.name}
                  onChange={(e) => setTempProfile({ ...tempProfile, name: e.target.value })}
                  placeholder="Tu Nombre"
                  className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-2 text-center text-white placeholder-white/50 font-bold focus:outline-none focus:bg-white/30 transition-colors"
                />
              ) : (
                <h3 className="text-2xl font-black tracking-tight">{profile.name || 'Usuario'}</h3>
              )}

              {!isEditing && (
                <p className="text-white/80 text-sm font-medium">
                  {profile.age ? `${profile.age} años` : ''}
                  {profile.age && profile.migraineType ? ' • ' : ''}
                  {profile.migraineType || 'Gestiona tu salud'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Edit Fields (Visible only when editing) */}
        {isEditing && (
          <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-100 dark:border-white/5 p-4 shadow-sm space-y-4 fade-in">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Detalles Personales</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1">Edad</label>
                <input
                  type="number"
                  value={tempProfile.age || ''}
                  onChange={(e) => setTempProfile({ ...tempProfile, age: parseInt(e.target.value) || undefined })}
                  placeholder="Ej: 30"
                  className="w-full bg-slate-50 dark:bg-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 ring-primary/20 outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 ml-1">Tipo de Migraña</label>
                <input
                  type="text"
                  value={tempProfile.migraineType || ''}
                  onChange={(e) => setTempProfile({ ...tempProfile, migraineType: e.target.value })}
                  placeholder="Ej: Con Aura"
                  className="w-full bg-slate-50 dark:bg-white/5 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 ring-primary/20 outline-none transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {/* Clinical Insights (Restored Feature) */}
        <div className="w-full bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-soft border border-slate-50 dark:border-white/5 overflow-hidden transition-all">
          <button
            onClick={() => setShowClinical(!showClinical)}
            className="w-full flex items-center justify-between p-6"
          >
            <div className="flex items-center gap-5">
              <div className="size-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-2xl">clinical_notes</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800 dark:text-white">Análisis Clínico</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 opacity-60">Tus patrones</p>
              </div>
            </div>
            <span className={`material-symbols-outlined text-slate-300 transition-transform duration-300 ${showClinical ? 'rotate-90' : ''}`}>chevron_right</span>
          </button>

          {showClinical && (
            <div className="px-6 pb-8 pt-2 space-y-4 fade-in">
              <div className="h-px bg-slate-50 dark:bg-white/5 mb-4"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-slate-50 dark:bg-background-dark/50 rounded-3xl border border-slate-100 dark:border-white/5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Síntoma Común</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title={insights?.topSymptom}>{insights?.topSymptom || 'Pendiente'}</p>
                </div>
                <div className="p-5 bg-slate-50 dark:bg-background-dark/50 rounded-3xl border border-slate-100 dark:border-white/5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Mejor Alivio</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate" title={insights?.topMed}>{insights?.topMed || 'Pendiente'}</p>
                </div>
              </div>
              <div className="p-5 bg-primary/5 rounded-3xl border border-primary/10 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">Zona Predominante</p>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{insights?.topLoc || 'No especificada'}</p>
                </div>
                <span className="material-symbols-outlined text-primary/30">location_on</span>
              </div>
            </div>
          )}
        </div>

        {/* Settings / Dark Mode (Restored Feature) */}
        <div className="w-full bg-white dark:bg-surface-dark rounded-[2.5rem] shadow-soft border border-slate-50 dark:border-white/5 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="size-12 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center shadow-inner">
                <span className="material-symbols-outlined text-2xl">{darkMode ? 'dark_mode' : 'light_mode'}</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800 dark:text-white">Modo Oscuro</p>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5 opacity-60">Interfaz visual</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} className="sr-only peer" />
              <div className="w-12 h-6.5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
            </label>
          </div>
        </div>

        {/* Data Management Section (Merged Backup Features) */}
        <div className="space-y-4 pt-4">
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
              ref={importInputRef}
              onChange={handleImportFileChange}
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

        <button
          onClick={handleLogout}
          className="mt-8 mx-auto flex items-center gap-2 text-red-300 dark:text-red-400/50 font-black text-[10px] uppercase tracking-[0.2em] hover:text-red-500 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Resetear / Cerrar
        </button>

        <div className="text-center mt-4">
          <p className="text-[9px] font-bold text-slate-300/50 uppercase tracking-widest">MigraCare v1.2</p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfileScreen;
