
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { storeService } from '../storeService';
import { Crisis } from '../types';

const StartLogScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  const selectedDate = location.state?.selectedDate || new Date().toISOString().split('T')[0];

  const handleRest = () => {
    setIsSaving(true);

    const restCrisis: Omit<Crisis, 'id'> = {
      date: selectedDate, // Use selected date
      type: 'Descanso',
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      intensity: 2,
      localization: [],
      painQuality: [],
      symptoms: ['Fatiga'],
      medications: [],
      functionalImpact: 'Limitado',
      notes: 'Registro automático: El usuario activó el modo descanso.',
      isPeriod: false
    };

    storeService.saveCrisis(restCrisis);

    setTimeout(() => {
      navigate('/biofeedback');
    }, 600);
  };

  return (
    <div className="relative h-screen w-full flex flex-col bg-background-light dark:bg-background-dark shadow-2xl overflow-hidden">
      <header className="flex items-center p-6 pb-2 justify-between z-10">
        <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-[32px]">close</span>
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 -mt-10">
        <div className="mb-12 text-center fade-in">
          <h2 className="text-slate-800 dark:text-white text-2xl font-bold opacity-90 leading-tight">
            ¿Cómo quieres registrar<br />tu estado?
          </h2>
          {selectedDate !== new Date().toISOString().split('T')[0] && (
            <p className="mt-2 text-sm text-primary font-bold bg-primary/10 px-3 py-1 rounded-full inline-block">
              Para: {new Date(selectedDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-6 w-full max-w-xs">
          {/* Registro Rápido */}
          <button
            onClick={() => navigate('/crisis-details', { state: { isLite: true, selectedDate } })}
            className="group relative flex items-center gap-4 p-5 rounded-3xl bg-white dark:bg-surface-dark border border-slate-100 dark:border-white/5 shadow-soft hover:shadow-glow transition-all active:scale-95"
          >
            <div className="size-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl">bolt</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-800 dark:text-white">Registro Rápido</p>
              <p className="text-xs text-slate-400 font-medium">Solo lo esencial</p>
            </div>
          </button>

          {/* Registro Detallado */}
          <button
            onClick={() => navigate('/crisis-details', { state: { isLite: false, selectedDate } })}
            className="group relative flex items-center gap-4 p-5 rounded-3xl bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-hover transition-all active:scale-95"
          >
            <div className="size-14 rounded-2xl bg-white/20 text-white flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-3xl">clinical_notes</span>
            </div>
            <div className="text-left">
              <p className="font-bold">Análisis Detallado</p>
              <p className="text-xs text-white/70 font-medium">Mapa, aura y medicina</p>
            </div>
          </button>
        </div>

        <button
          onClick={handleRest}
          disabled={isSaving}
          className="mt-16 flex items-center justify-center h-12 px-8 rounded-full border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-surface-dark/50 text-slate-500 dark:text-slate-400 text-sm font-medium shadow-sm fade-in hover:bg-white dark:hover:bg-surface-dark transition-all active:scale-95 disabled:opacity-50"
          style={{ animationDelay: '0.2s' }}
        >
          {isSaving ? (
            <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
          ) : (
            <span className="material-symbols-outlined mr-2 text-[20px]">bed</span>
          )}
          {isSaving ? 'Guardando pausa...' : 'Solo necesito descansar'}
        </button>
      </main>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10" style={{ background: 'radial-gradient(circle at 50% 20%, #ec4899 0%, transparent 60%)' }}></div>
    </div>
  );
};

export default StartLogScreen;
