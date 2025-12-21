
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

interface Factor {
  id: string;
  name: string;
  icon: string;
  impact: string;
  color: string;
  type: 'trigger' | 'protector';
  correlation: number;
  description: string;
  pos: { top: string, left: string };
}

const FACTORS: Factor[] = [
  { id: 'sleep', name: 'Sueño', icon: 'bedtime', impact: '+45%', color: 'text-primary', type: 'protector', correlation: 85, description: 'Mantener una higiene de sueño constante ha reducido tus crisis en un 45% esta semana.', pos: { top: '22%', left: '50%' } },
  { id: 'stress', name: 'Estrés', icon: 'psychology', impact: '-30%', color: 'text-secondary', type: 'trigger', correlation: 72, description: 'Los picos de estrés laboral preceden el 72% de tus migrañas intensas.', pos: { top: '65%', left: '25%' } },
  { id: 'water', name: 'Hidratación', icon: 'water_drop', impact: '+22%', color: 'text-blue-400', type: 'protector', correlation: 60, description: 'Beber 2.5L de agua al día actúa como un escudo protector moderado.', pos: { top: '45%', left: '82%' } },
  { id: 'weather', name: 'Clima', icon: 'thunderstorm', impact: '-15%', color: 'text-amber-400', type: 'trigger', correlation: 40, description: 'Los cambios bruscos de presión atmosférica son un detonante de baja frecuencia.', pos: { top: '38%', left: '15%' } },
  { id: 'food', name: 'Dieta', icon: 'restaurant', impact: '+10%', color: 'text-emerald-400', type: 'protector', correlation: 30, description: 'Evitar ultraprocesados ha mostrado una correlación positiva leve.', pos: { top: '75%', left: '70%' } },
];

const TriggerMapScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeFactor, setActiveFactor] = useState<Factor>(FACTORS[0]);
  const [timeRange, setTimeRange] = useState('30 Días');

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display pb-24 transition-colors duration-300">
      
      {/* Header Compacto y Moderno */}
      <div className="flex items-center px-6 py-4 sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-white/5">
        <button 
          onClick={() => navigate(-1)}
          className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-white/5 active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back_ios_new</span>
        </button>
        <div className="flex-1 text-center pr-10">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Análisis IA</h2>
        </div>
      </div>

      {/* Título y Filtros */}
      <div className="flex flex-col px-6 pt-6">
        <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">Mapa de Impacto</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mt-1">
          Identifica qué factores protegen o detonan tus crisis.
        </p>

        <div className="flex gap-2 mt-6 overflow-x-auto no-scrollbar py-1">
          {['7 Días', '30 Días', 'Histórico'].map((range) => (
            <button 
              key={range}
              onClick={() => setTimeRange(range)}
              className={`flex h-10 shrink-0 items-center justify-center px-5 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all border ${
                timeRange === range 
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                  : 'bg-white dark:bg-surface-dark text-slate-400 border-slate-100 dark:border-white/5'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Área del Radar - Visualización Central */}
      <div className="relative w-full aspect-square flex items-center justify-center overflow-visible px-6 my-4">
        {/* Círculos de Fondo con Gradiente Suave */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-12">
          <div className="w-full h-full rounded-full border border-slate-200 dark:border-white/5 bg-white/20 dark:bg-transparent"></div>
          <div className="absolute w-[66%] h-[66%] rounded-full border border-slate-200 dark:border-white/5"></div>
          <div className="absolute w-[33%] h-[33%] rounded-full border border-slate-200 dark:border-white/5"></div>
          
          {/* Ejes de Radar */}
          <div className="absolute w-full h-px bg-slate-100 dark:bg-white/5 top-1/2 -translate-y-1/2"></div>
          <div className="absolute h-full w-px bg-slate-100 dark:bg-white/5 left-1/2 -translate-x-1/2"></div>
          
          {/* Halo Dinámico según el factor seleccionado */}
          <div className={`absolute size-40 rounded-full blur-[60px] opacity-20 transition-colors duration-700 ${activeFactor.type === 'protector' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
        </div>

        {/* Burbujas de Factores con Animaciones */}
        {FACTORS.map((f, idx) => {
          const isActive = activeFactor.id === f.id;
          // Tamaños responsivos para móvil
          const size = f.id === 'sleep' ? 'size-24' : f.id === 'stress' ? 'size-20' : 'size-18';
          
          return (
            <div 
              key={f.id}
              onClick={() => setActiveFactor(f)}
              style={{ 
                top: f.pos.top, 
                left: f.pos.left,
                animationDelay: `${idx * 0.8}s` // Retardo único para cada burbuja
              }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 animate-float ${isActive ? 'z-30 scale-110' : 'z-20 scale-100 opacity-60'}`}
            >
              <div 
                className={`flex flex-col items-center justify-center rounded-full backdrop-blur-xl border transition-all ${size} ${
                  isActive 
                    ? 'bg-white/90 dark:bg-surface-highlight/90 border-primary shadow-2xl shadow-primary/30 ring-4 ring-primary/5 animate-pulse-subtle' 
                    : 'bg-white/40 dark:bg-surface-dark/60 border-slate-100 dark:border-white/10'
                }`}
              >
                <span className={`material-symbols-outlined ${f.color} ${isActive ? 'animate-pulse' : ''}`} style={{ fontSize: isActive ? '28px' : '22px' }}>{f.icon}</span>
                <span className="text-[8px] font-black uppercase tracking-tighter mt-1 text-slate-800 dark:text-white/80">{f.name}</span>
                <span className={`text-[9px] font-black ${f.type === 'protector' ? 'text-emerald-500' : 'text-red-500'}`}>{f.impact}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Panel de Detalles Estilo "Modern Drawer" */}
      <div className="mt-auto px-4 pb-4">
        <div className="bg-white dark:bg-surface-dark rounded-[2.5rem] p-6 shadow-2xl border border-slate-100 dark:border-white/5 fade-in" key={activeFactor.id}>
          <div className="flex items-center gap-5 mb-5">
            <div className={`size-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${activeFactor.type === 'protector' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500' : 'bg-red-50 dark:bg-red-500/10 text-red-500'}`}>
              <span className="material-symbols-outlined text-3xl">{activeFactor.icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex flex-col">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white truncate">{activeFactor.name}</h3>
                  <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${activeFactor.type === 'protector' ? 'text-emerald-500' : 'text-red-500'}`}>
                    {activeFactor.type === 'protector' ? 'Escudo Protector' : 'Detonante Crítico'}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-black text-primary leading-none">{activeFactor.correlation}%</p>
                  <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mt-1">Relevancia</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-background-dark/30 rounded-3xl p-5 border border-slate-50 dark:border-white/5 mb-6">
            <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">
              "{activeFactor.description}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/chat')}
              className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">smart_toy</span>
              Consultar IA
            </button>
            <button 
              onClick={() => navigate('/calendar')}
              className="flex-1 py-4 bg-white dark:bg-surface-highlight text-slate-400 dark:text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-slate-100 dark:border-white/5 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">history</span>
              Ver Historial
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default TriggerMapScreen;
