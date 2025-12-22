
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
  avatar: 'face_3'
};

const AVATARS = ['face_3', 'face_2', 'face_4', 'face_5', 'face_6', 'sentiment_satisfied', 'mood', 'person', 'pets', 'hotel_class'];

const ProfileScreen: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>(INITIAL_PROFILE);

  // Backup state
  const [importStatus, setImportStatus] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = storeService.getProfile();
    if (stored) {
      setProfile(stored);
      setTempProfile(stored);
    }
  }, []);

  const handleSaveProfile = () => {
    storeService.saveProfile(tempProfile);
    setProfile(tempProfile);
    setIsEditing(false);
  };

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
        const newProfile = storeService.getProfile();
        if (newProfile) {
          setProfile(newProfile);
          setTempProfile(newProfile);
        }
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
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark pb-20 font-display">
      <header className="flex items-center px-4 py-4 pt-6 bg-white dark:bg-surface-dark shadow-sm z-10 sticky top-0">
        <h2 className="text-xl font-bold flex-1 text-slate-800 dark:text-white">Mi Perfil</h2>
        <button
          onClick={() => {
            if (isEditing) handleSaveProfile();
            else setIsEditing(true);
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
              <div className="size-24 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border-4 border-white/30 shadow-inner">
                <span className="material-symbols-outlined text-5xl text-white">
                  {isEditing ? tempProfile.avatar || 'face_3' : profile.avatar || 'face_3'}
                </span>
              </div>
              {isEditing && (
                <div className="absolute inset-x-0 -bottom-2 flex justify-center">
                  <div className="bg-black/50 backdrop-blur-md rounded-full px-2 py-0.5">
                    <span className="text-[10px] uppercase font-bold text-white/90">Cambiar</span>
                  </div>
                </div>
              )}
            </div>

            {isEditing && (
              <div className="grid grid-cols-5 gap-2 w-full mt-2 bg-black/20 p-2 rounded-xl backdrop-blur-sm">
                {AVATARS.map(av => (
                  <button
                    key={av}
                    onClick={() => setTempProfile({ ...tempProfile, avatar: av })}
                    className={`size-10 rounded-full flex items-center justify-center transition-all ${tempProfile.avatar === av ? 'bg-white text-primary' : 'hover:bg-white/10 text-white/70'}`}
                  >
                    <span className="material-symbols-outlined text-xl">{av}</span>
                  </button>
                ))}
              </div>
            )}

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

        {/* Data Management Section (Always Visible) */}
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
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfileScreen;
