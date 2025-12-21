
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NavLink: React.FC<{ to: string, icon: string, label: string }> = ({ to, icon, label }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <button 
      onClick={() => navigate(to)} 
      className={`flex flex-col items-center gap-1 w-16 group transition-colors ${isActive ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
    >
      <span 
        className="material-symbols-outlined text-[24px]" 
        style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
      >
        {icon}
      </span>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );
};

const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-md border-t border-slate-100 dark:border-white/5 pb-5 pt-3 max-w-md mx-auto">
      <div className="grid grid-cols-5 w-full">
        <NavLink to="/" icon="home" label="Inicio" />
        <NavLink to="/calendar" icon="calendar_month" label="Calendario" />
        <NavLink to="/chat" icon="smart_toy" label="IA Chat" />
        <NavLink to="/triggers" icon="insights" label="Análisis" />
        <NavLink to="/profile" icon="person" label="Perfil" />
      </div>
    </nav>
  );
};

export default BottomNav;
