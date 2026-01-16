import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: string;
  colorClass?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, icon, colorClass = "text-primary", onClick }) => (
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

export default StatCard;
