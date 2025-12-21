
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeService } from '../storeService';

// Estilo estrictamente faceless basado en la imagen de referencia
// Usamos el motor avataaars-neutral de DiceBear v9 para evitar imágenes rotas
const AVATARS = [
  {
    id: 'red',
    name: 'Carmesí',
    // Perfil inspirado en la imagen adjunta: Cabello castaño rojizo, ropa neutra
    url: 'https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Molly&backgroundColor=ffffff&backgroundType=gradientLinear&clothingColor=e1caaa'
  },
  {
    id: 'blue',
    name: 'Sereno',
    url: 'https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Felix&backgroundColor=e3f2fd&clothingColor=90caf9'
  },
  {
    id: 'green',
    name: 'Vital',
    url: 'https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Aneka&backgroundColor=e8f5e9&clothingColor=a5d6a7'
  },
  {
    id: 'yellow',
    name: 'Calma',
    url: 'https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Aiden&backgroundColor=fff8e1&clothingColor=ffe082'
  },
];

const MIGRAINE_TYPES = [
  { id: 'Sin Aura', title: 'Migraña Común', desc: 'Sin avisos visuales.', icon: 'psychology' },
  { id: 'Con Aura', title: 'Con Aura', desc: 'Destellos antes del dolor.', icon: 'blur_on' },
  { id: 'Crónica', title: 'Crónica', desc: 'Frecuencia elevada.', icon: 'event_repeat' },
];

const OnboardingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState('Sin Aura');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].url);

  const handleStart = () => {
    if (!name.trim()) return;
    const typeObj = MIGRAINE_TYPES.find(t => t.id === selectedType);
    storeService.saveProfile({
      name,
      migraineType: typeObj?.title || 'No definido',
      joinedDate: new Date().toISOString(),
      avatar: selectedAvatar
    });
    navigate('/');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-background-light dark:bg-background-dark p-6 overflow-y-auto no-scrollbar font-display">
      <div className="flex flex-col items-center text-center mt-6 mb-10">
        <div className="size-20 rounded-[2rem] bg-primary flex items-center justify-center text-white shadow-glow mb-6 animate-float">
          <span className="material-symbols-outlined text-4xl">auto_awesome</span>
        </div>
        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2 tracking-tight">Bienvenido a MigraCare</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Configura tu perfil para un cuidado personalizado.</p>
      </div>

      <div className="w-full max-w-sm mx-auto space-y-10 pb-12">
        {/* Paso 1: Nombre */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Tu Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Escribe tu nombre..."
            className="w-full bg-white dark:bg-surface-dark border-none rounded-3xl px-6 py-5 shadow-soft focus:ring-2 focus:ring-primary text-sm font-bold outline-none placeholder:text-slate-300"
          />
        </div>

        {/* Paso 2: Selección de Personaje Faceless */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Elige tu Avatar</label>
          <div className="grid grid-cols-5 gap-3">
            {AVATARS.map((av) => (
              <button
                key={av.id}
                onClick={() => setSelectedAvatar(av.url)}
                className={`relative aspect-square rounded-full transition-all overflow-hidden border-2 ${selectedAvatar === av.url ? 'border-primary scale-110 shadow-lg ring-4 ring-primary/10' : 'border-transparent bg-white dark:bg-surface-dark'}`}
              >
                <img src={av.url} alt={av.name} className="w-full h-full object-cover" />
              </button>
            ))}
            <label className="aspect-square rounded-full border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center cursor-pointer hover:bg-white dark:hover:bg-surface-dark/50 transition-colors overflow-hidden">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              {selectedAvatar.startsWith('data:') ? (
                <img src={selectedAvatar} alt="custom" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-slate-300">photo_camera</span>
              )}
            </label>
          </div>
        </div>

        {/* Paso 3: Tipo de Migraña */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block ml-1">Tu Diagnóstico</label>
          <div className="grid grid-cols-1 gap-3">
            {MIGRAINE_TYPES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`flex items-center gap-4 p-5 rounded-3xl border-2 text-left transition-all ${selectedType === t.id ? 'bg-white dark:bg-surface-highlight border-primary shadow-md' : 'bg-white/50 dark:bg-surface-dark border-transparent opacity-70'}`}
              >
                <div className={`size-12 rounded-2xl flex items-center justify-center ${selectedType === t.id ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                  <span className="material-symbols-outlined text-2xl">{t.icon}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-black text-slate-800 dark:text-white">{t.title}</h4>
                  <p className="text-[11px] text-slate-400 font-medium leading-tight">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          disabled={!name.trim()}
          className="w-full bg-primary text-white py-6 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/30 active:scale-95 transition-all disabled:opacity-30"
        >
          Comenzar Experiencia
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen;
