
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { storeService } from '../storeService';
import { UserProfile } from '../types';

const ReportScreen: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({ totalRecent: 0, avgIntensity: "0", totalHistory: 0, daysFree: 0 });
  const [insights, setInsights] = useState<{ topSymptom: string, topMed: string, topLoc: string } | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    const p = storeService.getProfile();
    setProfile(p);

    // Optimized: Fetch crises once and reuse
    const crises = storeService.getCrises();
    setStats(storeService.getStats(crises));
    setInsights(storeService.getClinicalInsights(crises));
  }, []);

  const handleShare = async () => {
    if (!profile) return;
    setIsSharing(true);
    const reportText = `Reporte Médico de Migraña - ${profile.name}\n` +
      `Crisis últimos 30 días: ${stats.totalRecent}\n` +
      `Intensidad promedio: ${stats.avgIntensity}/10\n` +
      `Síntoma predominante: ${insights?.topSymptom || 'N/A'}\n` +
      `Tratamiento más efectivo: ${insights?.topMed || 'N/A'}\n` +
      `Generado por Alivio App.`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Reporte Alivio - ${profile.name}`,
          text: reportText,
        });
      } catch (err) {
        console.log('Error al compartir', err);
      }
    } else {
      // Fallback: Copiar al portapapeles
      navigator.clipboard.writeText(reportText);
      alert('Reporte copiado al portapapeles');
    }
    setIsSharing(false);
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark font-display">
      <header className="flex items-center justify-between px-4 py-4 pt-6 bg-white dark:bg-surface-dark border-b border-pink-100 dark:border-white/5 z-10 shrink-0">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-500 hover:text-primary transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h1 className="text-sm font-black uppercase tracking-widest text-center flex-1 pr-10">Reporte Clínico</h1>
      </header>

      <main className="flex-1 overflow-y-auto p-5 pb-32 space-y-6 no-scrollbar">
        {/* Cabecera del Reporte Estilo Papel */}
        <div className="bg-white dark:bg-card-dark rounded-3xl shadow-soft border border-pink-100 dark:border-white/5 overflow-hidden fade-in">
          <div className="h-3 w-full bg-gradient-to-r from-primary via-secondary to-primary"></div>
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
                  {profile?.name || 'Usuario'}
                </h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Paciente ID: {profile?.name?.slice(0,3).toUpperCase() || 'ALV'}-{Math.floor(Math.random()*900)+100}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Fecha Reporte</p>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">{new Date().toLocaleDateString('es-ES')}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-2">Crisis (30d)</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-primary">{stats.totalRecent}</span>
                  <span className="text-[10px] font-bold text-slate-400">eventos</span>
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-surface-dark border border-slate-100 dark:border-white/5">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block mb-2">Intensidad</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-800 dark:text-white">{stats.avgIntensity}</span>
                  <span className="text-[10px] font-bold text-slate-400">/10 prom.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Patrones */}
        <div className="space-y-4 fade-in" style={{animationDelay: '0.1s'}}>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">Hallazgos y Patrones</h3>
          
          <div className="bg-white dark:bg-card-dark p-6 rounded-3xl border border-slate-100 dark:border-white/5 space-y-5">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">psychology</span>
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Síntoma Predominante</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{insights?.topSymptom || 'Ninguno registrado'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">medication</span>
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tratamiento más efectivo</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{insights?.topMed || 'Sin datos de alivio'}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="size-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-xl">location_on</span>
              </div>
              <div className="flex-1">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Localización más frecuente</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{insights?.topLoc || 'No especificada'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nota Legal */}
        <div className="p-5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/20 flex items-start gap-3 fade-in" style={{animationDelay: '0.2s'}}>
          <span className="material-symbols-outlined text-amber-500 mt-0.5">info</span>
          <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
            Este informe es una recopilación de datos de autogestión para facilitar la comunicación con su neurólogo. No reemplaza un diagnóstico profesional.
          </p>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 dark:bg-surface-dark/95 border-t border-slate-100 dark:border-white/5 p-4 pb-10 z-20">
        <button 
          onClick={handleShare}
          disabled={isSharing}
          className="w-full h-14 flex items-center justify-center gap-3 rounded-[1.8rem] bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
        >
          {isSharing ? (
            <div className="size-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <span className="material-symbols-outlined">share</span>
              Enviar Informe Médico
            </>
          )}
        </button>
      </footer>
    </div>
  );
};

export default ReportScreen;
