
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { storeService } from '../storeService';
import { UserProfile } from '../types';

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showClinical, setShowClinical] = useState(false);
  const [insights, setInsights] = useState<{ topSymptom: string, topMed: string, topLoc: string } | null>(null);
  const [darkMode, setDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    setProfile(storeService.getProfile());
    setInsights(storeService.getClinicalInsights());
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && profile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const updatedProfile = { ...profile, avatar: base64 };
        setProfile(updatedProfile);
        storeService.saveProfile(updatedProfile);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión? Se borrarán todos tus datos locales.')) {
      storeService.clearAllData();
      navigate('/onboarding');
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col bg-background-light dark:bg-background-dark pb-24 font-display transition-colors">
      <header className="flex items-center px-4 py-4 pt-6 bg-white dark:bg-surface-dark shadow-sm border-b border-slate-100 dark:border-white/5">
        <h2 className="text-[10px] font-black uppercase tracking-[0.2em] flex-1 text-center text-slate-400">Mi Cuenta</h2>
      </header>

      <div className="flex-1 flex flex-col items-center p-6">
        {/* Avatar Faceless Robusto */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*" 
            />
            <div 
              onClick={handleAvatarClick}
              className="size-36 rounded-full bg-white dark:bg-surface-dark flex items-center justify-center text-primary border-8 border-white dark:border-surface-highlight shadow-2xl overflow-hidden cursor-pointer group"
            >
              <img 
                src={profile?.avatar || 'https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Molly&backgroundColor=ffffff&clothingColor=e1caaa'} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                alt="Profile" 
              />
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                <span className="material-symbols-outlined text-white text-4xl">photo_camera</span>
              </div>
            </div>
            <div 
              onClick={handleAvatarClick}
              className="absolute bottom-2 right-2 bg-primary text-white size-10 flex items-center justify-center rounded-2xl shadow-xl border-4 border-white dark:border-surface-dark cursor-pointer active:scale-90 transition-transform"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </div>
          </div>
          <h2 className="text-3xl font-black text-slate-800 dark:text-white leading-tight">{profile?.name || 'Usuario'}</h2>
          <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mt-3 px-5 py-2 bg-primary/10 rounded-full border border-primary/10">
            {profile?.migraineType || 'No especificado'}
          </p>
        </div>

        {/* Menú de Opciones */}
        <div className="w-full space-y-4">
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
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{insights?.topSymptom || 'Pendiente'}</p>
                  </div>
                  <div className="p-5 bg-slate-50 dark:bg-background-dark/50 rounded-3xl border border-slate-100 dark:border-white/5">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Mejor Alivio</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{insights?.topMed || 'Pendiente'}</p>
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
        </div>

        <button 
          onClick={handleLogout}
          className="mt-16 flex items-center gap-2 text-red-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-red-500 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">logout</span>
          Cerrar Sesión
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfileScreen;
