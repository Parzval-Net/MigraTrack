
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BiofeedbackScreen: React.FC = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'Inhala' | 'Mantén' | 'Exhala'>('Inhala');
  const [counter, setCounter] = useState(4);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter(prev => {
        if (prev === 1) {
          if (phase === 'Inhala') { setPhase('Mantén'); return 4; }
          if (phase === 'Mantén') { setPhase('Exhala'); return 4; }
          setPhase('Inhala'); return 4;
        }
        return prev - 1;
      });
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex h-screen w-full flex-col justify-between overflow-hidden bg-background-light dark:bg-[#101622] transition-colors duration-300">
      <header className="flex items-center justify-between px-4 py-4 pt-6 z-20">
        <button onClick={() => navigate(-1)} className="flex size-10 items-center justify-center rounded-full text-slate-500 hover:bg-slate-200/50 transition-colors">
          <span className="material-symbols-outlined" style={{fontSize: '28px'}}>close</span>
        </button>
        <h2 className="text-slate-600 dark:text-white/90 text-sm font-semibold tracking-wide uppercase">Biofeedback: Respiración</h2>
        <div className="size-10"></div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative w-full -mt-10">
        <div className="relative flex items-center justify-center py-10">
          <div className={`absolute inset-0 bg-primary/10 blur-[80px] rounded-full transition-transform duration-[4000ms] ${phase === 'Inhala' ? 'scale-[2.5]' : 'scale-[1.5]'}`}></div>
          <div className="w-72 h-72 rounded-full bg-white dark:bg-surface-dark border border-slate-200 flex items-center justify-center relative z-10">
            <div className={`w-full h-full rounded-full flex items-center justify-center transition-all duration-[4000ms] ${phase === 'Inhala' ? 'p-4' : 'p-20'}`}>
              <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                 <span className="material-symbols-outlined text-primary/40 text-4xl">air</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center text-center px-6 z-20 mt-8 space-y-2">
          <h1 className="text-slate-800 dark:text-white text-4xl font-bold tracking-tight">
            {phase}...
          </h1>
          <p className="text-primary text-2xl font-medium tracking-widest pt-2">
            {counter}
          </p>
        </div>
      </main>

      <footer className="w-full bg-background-light dark:bg-[#101622] pb-8 pt-4 flex flex-col z-20">
        <div className="text-center">
          <span className="text-slate-400 dark:text-white/30 text-xs font-mono tracking-wider">{formatTime(timeLeft)} RESTANTE</span>
        </div>
      </footer>
    </div>
  );
};

export default BiofeedbackScreen;
