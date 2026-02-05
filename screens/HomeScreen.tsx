
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { storeService } from '../storeService';
import { Crisis, UserProfile } from '../types';

const PRINCIPITO_QUOTES = [
  "Lo esencial es invisible a los ojos.",
  "Fue el tiempo que pasaste con tu rosa lo que la hizo tan importante.",
  "Es una locura odiar a todas las rosas porque una te pinchó.",
  "Caminando en línea recta no puede uno llegar muy lejos.",
  "Lo que hace hermoso al desierto es que esconde un pozo.",
  "Si vienes a las cuatro, empezaré a ser feliz desde las tres.",
  "Eres responsable de lo que has domesticado.",
  "Todas las personas mayores fueron al principio niños.",
  "Es mucho más difícil juzgarse a sí mismo que a los demás."
];

const HomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({ totalRecent: 0, avgIntensity: "0", totalHistory: 0, daysFree: 0 });
  const [recentCrises, setRecentCrises] = useState<Crisis[]>([]);
  const [quote, setQuote] = useState(PRINCIPITO_QUOTES[0]);
  const [quoteKey, setQuoteKey] = useState(0);

  const [recommendation, setRecommendation] = useState({ factor: 'Hidratación', goal: '2.5L hoy', icon: 'water_drop', color: 'text-blue-500' });

  useEffect(() => {
    const currentProfile = storeService.getProfile();
    if (!currentProfile) {
      navigate('/onboarding');
      return;
    }
    setProfile(currentProfile);

    const s = storeService.getStats();
    setStats(s);

    const crises = storeService.getCrises();
    // Crises are now pre-sorted by date descending in storeService
    setRecentCrises(crises.slice(0, 3));

    if (s.daysFree > 3) {
      setRecommendation({ factor: 'Sueño', goal: 'Mantener ritmo', icon: 'bedtime', color: 'text-primary' });
    } else if (Number(s.avgIntensity) > 5) {
      setRecommendation({ factor: 'Estrés', goal: 'Biofeedback', icon: 'psychology', color: 'text-secondary' });
    }
  }, [navigate]); // Keep this effect focused on data load

  // Effect independent for rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setQuote(prev => {
        const currentIndex = PRINCIPITO_QUOTES.indexOf(prev);
        const nextIndex = (currentIndex + 1) % PRINCIPITO_QUOTES.length;
        return PRINCIPITO_QUOTES[nextIndex];
      });
      setQuoteKey(prev => prev + 1);
    }, 8000); // Faster rotation (8s) so user sees it change

    return () => clearInterval(interval);
  }, []);

  const StatCard: React.FC<{ label: string, value: string | number, subValue?: string, icon: string, colorClass?: string, onClick?: () => void }> = ({ label, value, subValue, icon, colorClass = "text-primary", onClick }) => (
    <div
      onClick={onClick}
      className={`flex flex-col gap-2 rounded-2xl p-5 bg-card-light dark:bg-card-dark border border-slate-100 dark:border-white/5 shadow-soft relative overflow-hidden group transition-all active:scale-[0.98] ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
        <span className="material-symbols-outlined text-4xl">{icon}</span>
      </div>
      <p className="text-text-muted text-[10px] font-black uppercase tracking-widest leading-normal z-10">{label}</p>
      <div className="flex flex-col z-10">
        <div className="flex items-end gap-1">
          <p className="text-text-main dark:text-white tracking-tight text-xl font-black leading-tight truncate max-w-full">
            {value}
          </p>
          {subValue && <span className="text-[9px] text-slate-400 font-black mb-1 uppercase tracking-tighter">{subValue}</span>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-32 bg-background-light dark:bg-background-dark font-display">
      <header className="flex p-4 pt-8">
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-4 items-center">
              <div
                onClick={() => navigate('/profile')}
                className="size-14 rounded-full border-2 border-primary/30 shadow-sm overflow-hidden bg-white cursor-pointer hover:scale-105 transition-transform"
              >
                <img
                  src={profile?.avatar || 'https://api.dicebear.com/9.x/avataaars-neutral/svg?seed=Molly&backgroundColor=ffffff&clothingColor=e1caaa'}
                  className="w-full h-full object-cover"
                  alt="Avatar"
                />
              </div>
              <div className="flex flex-col justify-center max-w-[220px]">
                <h1 className="text-text-main dark:text-white text-xl font-bold leading-tight tracking-tight truncate">Hola, {profile?.name || 'Usuario'}</h1>
                <div key={quoteKey} className="flex items-start gap-1.5 mt-0.5 fade-in">
                  <span className="material-symbols-outlined text-amber-400 text-[16px] shrink-0 mt-0.5">stars</span>
                  <p className="text-text-muted text-[11px] font-medium leading-tight italic line-clamp-2 transition-opacity duration-1000">
                    "{quote}"
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/notifications')}
              className="bg-white dark:bg-card-dark p-2.5 rounded-2xl text-text-muted shadow-sm border border-slate-100 dark:border-white/5 hover:bg-slate-50 transition-colors"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </div>
      </header>

      <section className="px-4 py-2">
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Días Libres"
            value={stats.daysFree}
            subValue="Días"
            icon="sentiment_very_satisfied"
            colorClass="text-emerald-500"
          />
          <StatCard
            label="Enfoque Hoy"
            value={recommendation.factor}
            subValue={recommendation.goal}
            icon={recommendation.icon}
            colorClass={recommendation.color}
            onClick={() => navigate('/triggers')}
          />
          <StatCard
            label="Intensidad 30d"
            value={stats.avgIntensity}
            subValue="/10"
            icon="monitoring"
            colorClass="text-primary"
          />
          <StatCard
            label="Frecuencia"
            value={stats.totalRecent}
            subValue="Crisis"
            icon="history"
            colorClass="text-secondary"
          />
        </div>
      </section>

      <section className="px-4 py-4">
        <div
          onClick={() => navigate('/biofeedback')}
          className="bg-primary/5 dark:bg-primary/10 rounded-[2rem] p-6 border border-primary/10 flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-all"
        >
          <div className="flex flex-col gap-1">
            <h4 className="text-primary font-black text-sm uppercase tracking-widest">Alivio en tiempo real</h4>
            <p className="text-text-main dark:text-slate-200 text-xs font-medium max-w-[180px]">Inicia una sesión de biofeedback para reducir la tensión.</p>
          </div>
          <div className="size-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-3xl">air</span>
          </div>
        </div>
      </section>

      <section className="px-4 py-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-text-main dark:text-white font-bold text-lg">Actividad Reciente</h3>
          <Link to="/calendar" className="text-primary text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-primary/10 rounded-lg">Ver Todo</Link>
        </div>
        <div className="space-y-3">
          {recentCrises.length > 0 ? (
            recentCrises.map(c => (
              <div
                key={c.id}
                onClick={() => navigate('/calendar')}
                className="flex items-center gap-4 p-4 bg-white dark:bg-card-dark rounded-2xl border border-slate-100 dark:border-white/5 shadow-soft hover:border-primary/20 transition-all cursor-pointer group"
              >
                <div className={`size-12 rounded-xl flex flex-col items-center justify-center font-black ${c.type === 'Descanso' ? 'bg-secondary/10 text-secondary' :
                  c.intensity > 7 ? 'bg-red-500/10 text-red-500' :
                    'bg-primary/10 text-primary'
                  }`}>
                  {c.type === 'Descanso' ? (
                    <span className="material-symbols-outlined text-xl">bed</span>
                  ) : (
                    <>
                      <span className="text-lg">{c.intensity > 0 ? c.intensity : 'P'}</span>
                      <span className="text-[8px] -mt-1 uppercase">{c.intensity > 0 ? '/10' : 'Menst'}</span>
                    </>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800 dark:text-white">
                    {c.type === 'Descanso' ? 'Pausa de recuperación' : new Date(c.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                      {c.startTime} {c.duration ? `• ${c.duration}` : ''}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">chevron_right</span>
              </div>
            ))
          ) : (
            <div className="p-10 text-center bg-slate-50 dark:bg-surface-dark/20 rounded-3xl border border-dashed border-slate-200 dark:border-white/5">
              <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">event_note</span>
              <p className="text-xs text-slate-400 font-medium">No hay registros.</p>
            </div>
          )}
        </div>
      </section>

      <div className="fixed bottom-[92px] right-4 left-4 z-30 flex justify-end">
        <Link to="/crisis-log" className="shadow-xl shadow-primary/30 flex items-center justify-center rounded-2xl h-14 px-8 bg-primary hover:bg-primary-hover transition-all hover:scale-[1.02] active:scale-95 text-white gap-3 border-t border-white/20">
          <span className="material-symbols-outlined text-[24px]">bolt</span>
          <span className="text-sm font-black uppercase tracking-widest">Nuevo Registro</span>
        </Link>
      </div>

      <BottomNav />
    </div>
  );
};

export default HomeScreen;
