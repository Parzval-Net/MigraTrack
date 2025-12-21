
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

interface Protector {
  id: string;
  name: string;
  icon: string;
  impact: string;
  color: string;
  borderColor: string;
  score: number;
  trend: string;
  description: string;
}

const PROTECTORS: Protector[] = [
  {
    id: 'sleep',
    name: 'Sueño',
    icon: 'bedtime',
    impact: '+45%',
    color: 'text-primary',
    borderColor: 'border-primary',
    score: 92,
    trend: '+12%',
    description: 'Mantener tu hora de dormir a las 11 PM ha reducido significativamente la frecuencia de ataques esta semana.'
  },
  {
    id: 'hydration',
    name: 'Hidratación',
    icon: 'water_drop',
    impact: '+22%',
    color: 'text-blue-400',
    borderColor: 'border-blue-200',
    score: 78,
    trend: '+5%',
    description: 'Estás al 80% de tu meta de agua. Intenta llegar a 2.5L para maximizar la protección contra cefaleas por deshidratación.'
  },
  {
    id: 'exercise',
    name: 'Ejercicio',
    icon: 'directions_run',
    impact: '+15%',
    color: 'text-green-400',
    borderColor: 'border-green-200',
    score: 65,
    trend: '+8%',
    description: 'Tus caminatas matutinas de 20 min están ayudando a regular tu sistema vascular.'
  },
  {
    id: 'diet',
    name: 'Alimentación',
    icon: 'restaurant',
    impact: '+10%',
    color: 'text-orange-400',
    borderColor: 'border-orange-200',
    score: 84,
    trend: '-2%',
    description: 'Evitar el chocolate y quesos curados ha estabilizado tus niveles inflamatorios.'
  }
];

const ProtectorsMapScreen: React.FC = () => {
  const navigate = useNavigate();
  const [activeProtector, setActiveProtector] = useState<Protector>(PROTECTORS[0]);
  const [timeRange, setTimeRange] = useState('7 Días');

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden bg-background-light dark:bg-background-dark font-display pb-32">
      {/* Header */}
      <div className="flex items-center p-4 pb-2 justify-between sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm">
        <button 
          onClick={() => navigate(-1)}
          className="flex size-10 shrink-0 items-center justify-center rounded-full text-slate-700 dark:text-slate-200 hover:bg-primary-soft dark:hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10 text-slate-800 dark:text-slate-100">Mapa de Protectores</h2>
      </div>

      {/* Intro */}
      <div className="flex flex-col px-6 pt-4 pb-2">
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-slate-800 dark:text-white">Tus mejores aliados</h1>
        <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-normal pt-2">
          Toca una burbuja para ver cómo este factor reduce tu riesgo de migraña.
        </p>
      </div>

      {/* Filtros de tiempo */}
      <div className="flex gap-3 px-6 py-4 overflow-x-auto no-scrollbar">
        {['7 Días', '30 Días', 'Histórico'].map((range) => (
          <button 
            key={range}
            onClick={() => setTimeRange(range)}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-all border ${
              timeRange === range 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-105' 
                : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {range === '7 Días' && <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_today</span>}
            <span className="text-sm font-medium">{range}</span>
          </button>
        ))}
      </div>

      {/* Mapa Visual */}
      <div className="relative w-full h-[360px] my-4 flex items-center justify-center overflow-hidden">
        {/* Radar concentric circles */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20 dark:opacity-10 pointer-events-none">
          <div className="w-[300px] h-[300px] rounded-full border border-primary/30 dark:border-primary/40"></div>
          <div className="absolute w-[200px] h-[200px] rounded-full border border-primary/30 dark:border-primary/40"></div>
          <div className="absolute w-[100px] h-[100px] rounded-full border border-primary/30 dark:border-primary/40"></div>
        </div>

        {/* Bubbles */}
        {/* Sueño - Main bubble */}
        <div 
          onClick={() => setActiveProtector(PROTECTORS[0])}
          className="absolute top-[10%] left-[50%] -translate-x-1/2 flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-110 active:scale-95 z-20"
        >
          <div className={`flex items-center justify-center w-32 h-32 rounded-full bg-primary/10 dark:bg-primary/20 backdrop-blur-md border-2 ${activeProtector.id === 'sleep' ? 'border-primary shadow-glow' : 'border-primary/40'} transition-all`}>
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-primary mb-1" style={{ fontSize: '32px' }}>bedtime</span>
              <span className="text-slate-800 dark:text-white font-bold text-lg">Sueño</span>
              <span className="text-primary text-xs font-bold">+45%</span>
            </div>
          </div>
        </div>

        {/* Hidratación */}
        <div 
          onClick={() => setActiveProtector(PROTECTORS[1])}
          className="absolute bottom-[20%] left-[10%] flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-110 active:scale-95 z-20"
        >
          <div className={`flex items-center justify-center w-24 h-24 rounded-full bg-white/60 dark:bg-surface-dark/60 backdrop-blur-md border ${activeProtector.id === 'hydration' ? 'border-blue-500 shadow-lg shadow-blue-500/20' : 'border-blue-200'} transition-all`}>
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-blue-400 mb-1" style={{ fontSize: '24px' }}>water_drop</span>
              <span className="text-slate-700 dark:text-slate-200 font-semibold text-sm">Agua</span>
              <span className="text-blue-400 text-xs font-bold">+22%</span>
            </div>
          </div>
        </div>

        {/* Ejercicio */}
        <div 
          onClick={() => setActiveProtector(PROTECTORS[2])}
          className="absolute bottom-[25%] right-[8%] flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-110 active:scale-95 z-20"
        >
          <div className={`flex items-center justify-center w-20 h-20 rounded-full bg-white/60 dark:bg-surface-dark/60 backdrop-blur-md border ${activeProtector.id === 'exercise' ? 'border-green-500 shadow-lg shadow-green-500/20' : 'border-green-200'} transition-all`}>
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-green-400 mb-1" style={{ fontSize: '20px' }}>directions_run</span>
              <span className="text-slate-700 dark:text-slate-200 font-semibold text-xs">Ejercicio</span>
              <span className="text-green-400 text-[10px] font-bold">+15%</span>
            </div>
          </div>
        </div>

        {/* Dieta */}
        <div 
          onClick={() => setActiveProtector(PROTECTORS[3])}
          className="absolute top-[28%] left-[8%] flex flex-col items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-110 active:scale-95 z-10"
        >
          <div className={`flex items-center justify-center w-16 h-16 rounded-full bg-white/40 dark:bg-surface-dark/40 backdrop-blur-sm border ${activeProtector.id === 'diet' ? 'border-orange-500 shadow-md shadow-orange-500/20' : 'border-orange-200'} transition-all`}>
            <div className="flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-orange-400" style={{ fontSize: '18px' }}>restaurant</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations Horizontal Scroll */}
      <div className="flex flex-col gap-4 px-6 pb-8">
        <div className="flex items-center justify-between">
          <h3 className="text-slate-800 dark:text-white text-lg font-bold">Recomendaciones</h3>
          <span className="text-primary text-sm font-medium cursor-pointer hover:text-primary-hover">Ver Detalles</span>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x">
          <div className="flex-none w-72 snap-center rounded-2xl bg-white dark:bg-surface-dark p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-xl bg-primary-soft dark:bg-primary/20 text-primary">
                <span className="material-symbols-outlined">shield</span>
              </div>
              <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400">Alto Impacto</span>
            </div>
            <h4 className="text-slate-800 dark:text-white font-bold text-lg mb-1">Constancia de Sueño</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Mantener tu hora de dormir a las 11 PM ha reducido significativamente la frecuencia de ataques esta semana.
            </p>
          </div>
          <div className="flex-none w-72 snap-center rounded-2xl bg-white dark:bg-surface-dark p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/20 text-blue-500">
                <span className="material-symbols-outlined">water_drop</span>
              </div>
              <span className="px-2 py-1 rounded text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">Impacto Medio</span>
            </div>
            <h4 className="text-slate-800 dark:text-white font-bold text-lg mb-1">Hidratación Diaria</h4>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              Estás al 80% de tu meta de agua. Intenta llegar a 2.5L para maximizar la protección.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Sheet Details */}
      <div className="mt-auto rounded-t-[2.5rem] bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-slate-800 p-8 shadow-[0_-10px_60px_rgba(209,86,130,0.15)] fade-in" key={activeProtector.id}>
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
        <div className="flex items-center gap-4 mb-6">
          <div className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-soft dark:bg-primary/20 text-primary border border-primary/20 dark:border-transparent`}>
            <span className="material-symbols-outlined text-3xl">{activeProtector.icon}</span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">{activeProtector.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Puntaje Protector: <span className="text-primary font-bold">{activeProtector.score}/100</span></p>
          </div>
          <div className={`flex items-center gap-1 ${activeProtector.trend.startsWith('+') ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10' : 'text-amber-600 bg-amber-50'} px-2 py-1 rounded-lg border border-transparent`}>
            <span className="material-symbols-outlined text-sm">{activeProtector.trend.startsWith('+') ? 'trending_up' : 'trending_down'}</span>
            <span className="text-sm font-bold">{activeProtector.trend}</span>
          </div>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
          {activeProtector.description}
        </p>

        {/* Small mock graph */}
        <div className="h-32 w-full mb-6 relative">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 50">
            <line className="text-slate-200 dark:text-slate-700" stroke="currentColor" strokeDasharray="2" strokeWidth="0.5" x1="0" x2="100" y1="0" y2="0"></line>
            <line className="text-slate-200 dark:text-slate-700" stroke="currentColor" strokeDasharray="2" strokeWidth="0.5" x1="0" x2="100" y1="25" y2="25"></line>
            <line className="text-slate-200 dark:text-slate-700" stroke="currentColor" strokeDasharray="2" strokeWidth="0.5" x1="0" x2="100" y1="50" y2="50"></line>
            <defs>
              <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#d06c9e" stopOpacity="0.25"></stop>
                <stop offset="100%" stopColor="#d06c9e" stopOpacity="0"></stop>
              </linearGradient>
            </defs>
            <path d="M0 40 Q 20 35, 40 15 T 80 20 T 100 5 V 50 H 0 Z" fill="url(#gradient)"></path>
            <path d="M0 40 Q 20 35, 40 15 T 80 20 T 100 5" fill="none" stroke="#d06c9e" strokeLinecap="round" strokeWidth="2.5"></path>
            <circle className="fill-white dark:fill-surface-dark stroke-primary" cx="40" cy="15" r="3" strokeWidth="2"></circle>
            <circle className="fill-white dark:fill-surface-dark stroke-primary" cx="100" cy="5" r="3" strokeWidth="2"></circle>
          </svg>
          <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold uppercase tracking-tighter">
            <span>Lun</span>
            <span>Mar</span>
            <span>Mié</span>
            <span>Jue</span>
            <span>Vie</span>
            <span>Hoy</span>
          </div>
        </div>

        <button 
          className="w-full py-4 bg-primary hover:bg-primary-hover text-white rounded-2xl font-bold text-base transition-all shadow-lg shadow-primary/30 active:scale-[0.98]"
        >
          Optimizar Rutina
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProtectorsMapScreen;
