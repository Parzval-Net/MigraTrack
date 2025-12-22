
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { storeService } from '../storeService';
import { Crisis, EntryType } from '../types';

type FilterType = 'Todos' | 'Dolor' | 'Medicina' | 'Periodo' | 'Descanso';

const CalendarScreen: React.FC = () => {
  const navigate = useNavigate();
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<string>(new Date().toISOString().split('T')[0]);
  const [crises, setCrises] = useState<Crisis[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('Todos');
  const [showMonthSelector, setShowMonthSelector] = useState(false);
  const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // ... (rest of logic)

  const monthName = viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const changeMonth = (offset: number) => {
    const next = new Date(viewDate);
    next.setMonth(next.getMonth() + offset);
    setViewDate(next);
  };

  const changeYear = (offset: number) => {
    const next = new Date(viewDate);
    next.setFullYear(next.getFullYear() + offset);
    setViewDate(next);
  }

  const selectMonth = (monthIndex: number) => {
    const next = new Date(viewDate);
    next.setMonth(monthIndex);
    setViewDate(next);
    setShowMonthSelector(false);
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const startOffset = firstDay === 0 ? 6 : firstDay - 1;
    const days = new Date(year, month + 1, 0).getDate();
    const prevMonthDays = new Date(year, month, 0).getDate();
    return { startOffset, days, prevMonthDays };
  };

  const { startOffset, days, prevMonthDays } = getDaysInMonth(viewDate);
  const dayArray = Array.from({ length: days }, (_, i) => i + 1);
  const prevMonthFill = Array.from({ length: startOffset }, (_, i) => prevMonthDays - startOffset + i + 1);

  const matchesFilter = (crisis: Crisis, filter: FilterType) => {
    if (filter === 'Todos') return true;
    if (filter === 'Dolor') return crisis.type === 'Migraña' || crisis.type === 'Dolor';
    if (filter === 'Periodo') return crisis.isPeriod === true;
    return crisis.type === filter;
  };

  const dayCrises = crises.filter(c => c.date === selectedDay && matchesFilter(c, activeFilter));

  const getDayIcons = (dateStr: string) => {
    const dailyEntries = crises.filter(c => c.date === dateStr);
    const icons = [];

    const hasPain = dailyEntries.some(e => e.type === 'Migraña' || e.type === 'Dolor');
    const hasMed = dailyEntries.some(e => (e.medications && e.medications.length > 0) || e.type === 'Medicina');
    const hasPeriod = dailyEntries.some(e => e.isPeriod);
    const hasRest = dailyEntries.some(e => e.type === 'Descanso');

    if (hasPain) icons.push({ icon: 'bolt', color: 'text-primary' });
    if (hasMed) icons.push({ icon: 'pill', color: 'text-emerald-400' });
    if (hasPeriod) icons.push({ icon: 'water_drop', color: 'text-rose-400' });
    if (hasRest) icons.push({ icon: 'bed', color: 'text-secondary' });

    return icons;
  };

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex flex-col overflow-hidden font-display">
      <header className="relative flex items-center justify-between px-4 py-3 bg-background-light dark:bg-background-dark z-20 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => setViewDate(new Date())} className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors">
            <span className="material-symbols-outlined">calendar_today</span>
          </button>
        </div>

        {/* Month Selector Toggle */}
        <div className="flex items-center gap-2 relative">
          <button onClick={() => changeMonth(-1)} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>

          <button
            onClick={() => setShowMonthSelector(!showMonthSelector)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <h2 className="text-lg font-bold tracking-tight capitalize">{monthName}</h2>
            <span className={`material-symbols-outlined text-sm transition-transform ${showMonthSelector ? 'rotate-180' : ''}`}>expand_more</span>
          </button>

          <button onClick={() => changeMonth(1)} className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>

          {/* Month Selector Overlay */}
          {showMonthSelector && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-white dark:bg-surface-dark rounded-3xl shadow-2xl border border-slate-100 dark:border-white/10 p-4 z-50 fade-in">
              {/* Year Navigator inside Overlay */}
              <div className="flex justify-between items-center mb-4 px-2">
                <button onClick={() => changeYear(-1)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10">
                  <span className="material-symbols-outlined text-slate-400">chevron_left</span>
                </button>
                <span className="text-lg font-black text-slate-800 dark:text-white">{viewDate.getFullYear()}</span>
                <button onClick={() => changeYear(1)} className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10">
                  <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {MONTHS.map((m, idx) => (
                  <button
                    key={m}
                    onClick={() => selectMonth(idx)}
                    className={`py-2.5 rounded-xl text-xs font-bold capitalize transition-all ${viewDate.getMonth() === idx
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                      }`}
                  >
                    {m.substring(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={`flex items-center justify-center size-10 rounded-xl border shadow-sm transition-colors ${showFilterMenu ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>filter_list</span>
          </button>
          {showFilterMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-dark rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 z-50 p-2 fade-in">
              <p className="px-3 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtrar por</p>
              {(['Todos', 'Dolor', 'Medicina', 'Periodo', 'Descanso'] as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => { setActiveFilter(f); setShowFilterMenu(false); }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors ${activeFilter === f ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Barra de Filtros Rápidos */}
      <div className="w-full overflow-x-auto no-scrollbar px-4 pb-4 shrink-0">
        <div className="flex gap-3 min-w-max">
          {(['Todos', 'Dolor', 'Medicina', 'Periodo', 'Descanso'] as FilterType[]).map((f) => {
            const isActive = activeFilter === f;
            const iconMap: Record<string, string> = {
              'Todos': 'apps',
              'Dolor': 'bolt',
              'Medicina': 'pill',
              'Periodo': 'water_drop',
              'Descanso': 'bed'
            };
            const colorMap: Record<string, string> = {
              'Todos': 'text-slate-400',
              'Dolor': 'text-primary',
              'Medicina': 'text-emerald-400',
              'Periodo': 'text-rose-400',
              'Descanso': 'text-secondary'
            };

            return (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`flex h-9 items-center gap-2 rounded-full px-4 border transition-all ${isActive
                  ? 'bg-primary/15 dark:bg-primary/20 border-primary/20 shadow-sm'
                  : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-700'
                  }`}
              >
                <span className={`material-symbols-outlined ${isActive ? colorMap[f] : 'text-slate-400'}`} style={{ fontSize: '16px' }}>
                  {iconMap[f]}
                </span>
                <span className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-slate-500 dark:text-slate-400'}`}>
                  {f.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <div className="px-2 pt-2">
          <div className="grid grid-cols-7 mb-2">
            {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
              <div key={d} className="text-center text-[11px] font-medium text-slate-400 uppercase tracking-wider py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-2 gap-x-1">
            {prevMonthFill.map(d => (
              <div key={`prev-${d}`} className="h-16 rounded-lg flex flex-col items-center justify-start pt-1.5 opacity-20">
                <span className="text-sm font-medium text-slate-500">{d}</span>
              </div>
            ))}

            {dayArray.map(d => {
              const dateObj = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
              const dateStr = dateObj.toISOString().split('T')[0];
              const isSelected = selectedDay === dateStr;
              const icons = getDayIcons(dateStr);
              const isToday = new Date().toISOString().split('T')[0] === dateStr;

              let cellStyle = "bg-white dark:bg-surface-dark/50 border-transparent hover:border-slate-200 dark:hover:border-slate-600";
              if (isSelected) cellStyle = "bg-primary text-white shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2 dark:ring-offset-background-dark z-10 scale-[1.02]";
              else if (icons.length > 0) cellStyle = "bg-primary/5 dark:bg-primary/10 border-primary/10";

              return (
                <button
                  key={d}
                  onClick={() => setSelectedDay(dateStr)}
                  className={`h-16 rounded-xl flex flex-col items-center justify-start pt-1.5 relative border transition-all duration-200 ${cellStyle}`}
                >
                  <span className={`text-sm ${isSelected ? 'font-black' : 'font-medium'}`}>
                    {d}
                  </span>
                  <div className="mt-1 flex flex-wrap justify-center gap-0.5 px-0.5">
                    {icons.map((icon, idx) => (
                      <span key={idx} className={`material-symbols-outlined ${isSelected ? 'text-white/80' : icon.color}`} style={{ fontSize: '12px' }}>
                        {icon.icon}
                      </span>
                    ))}
                  </div>
                  {isToday && !isSelected && (
                    <div className="absolute bottom-1 size-1 bg-primary rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 py-6 fade-in" key={selectedDay}>
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-slate-900 dark:text-slate-100 font-bold text-xl">
              {new Date(selectedDay).toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}
            </h3>
            {new Date().toISOString().split('T')[0] === selectedDay && (
              <span className="text-[10px] font-black px-2 py-1 rounded-md bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-widest">Hoy</span>
            )}
          </div>

          <div className="space-y-4">
            {dayCrises.length > 0 ? (
              dayCrises.map(c => (
                <div key={c.id} className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm group hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-50 dark:border-slate-800">
                    <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${c.type === 'Descanso' ? 'bg-secondary/10 text-secondary' :
                      c.intensity > 7 ? 'bg-red-500/10 text-red-500' :
                        'bg-primary/10 text-primary'
                      }`}>
                      {c.type === 'Medicina' ? (
                        <span className="material-symbols-outlined text-2xl">pill</span>
                      ) : c.type === 'Descanso' ? (
                        <span className="material-symbols-outlined text-2xl">bed</span>
                      ) : (
                        <span className="text-lg font-black">{c.intensity > 0 ? c.intensity : <span className="material-symbols-outlined">water_drop</span>}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{c.type}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                        {c.startTime} {c.duration ? `• ${c.duration}` : ''}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <button
                        onClick={() => navigate('/crisis-details', { state: { crisisToEdit: c } })}
                        className="text-primary text-xs font-black uppercase tracking-widest hover:text-primary-hover p-2"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('¿Seguro que quieres eliminar este registro?')) {
                            storeService.deleteCrisis(c.id);
                            setCrises(storeService.getCrises()); // Refresh list
                          }
                        }}
                        className="text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-red-400 p-2"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    {c.type === 'Descanso' ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium italic">Pausa de recuperación activada.</p>
                    ) : (
                      <>
                        {c.symptoms.length > 0 && (
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 mt-0.5" style={{ fontSize: '20px' }}>add_reaction</span>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Síntomas</p>
                              <p className="text-xs text-slate-700 dark:text-slate-300">{c.symptoms.join(', ')}</p>
                            </div>
                          </div>
                        )}
                        {c.medications.length > 0 && (
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 mt-0.5" style={{ fontSize: '20px' }}>medication</span>
                            <div>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Alivio</p>
                              <p className="text-xs text-slate-700 dark:text-slate-300">
                                {c.medications.map(m => `${m.name} (${m.dose})`).join(', ')}
                              </p>
                            </div>
                          </div>
                        )}
                        {c.isPeriod && (
                          <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-rose-300 mt-0.5" style={{ fontSize: '20px' }}>water_drop</span>
                            <div>
                              <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Estado</p>
                              <p className="text-xs text-rose-500 font-medium">En periodo menstrual</p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-30">event_available</span>
                <p className="text-xs font-bold uppercase tracking-widest">Día sin registros</p>
                <button
                  onClick={() => navigate('/crisis-log', { state: { selectedDate: selectedDay } })}
                  className="mt-4 text-primary text-[10px] font-black uppercase tracking-widest underline"
                >
                  Registrar algo hoy
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-24 right-5 z-20">
        {selectedDay <= new Date().toISOString().split('T')[0] ? (
          <button
            onClick={() => navigate('/crisis-log', { state: { selectedDate: selectedDay } })}
            className="flex items-center justify-center size-14 rounded-2xl bg-primary text-white shadow-xl shadow-primary/30 hover:bg-primary-hover active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>add</span>
          </button>
        ) : (
          <button
            disabled
            className="flex items-center justify-center size-14 rounded-2xl bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed opacity-50"
            title="No puedes registrar en el futuro"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>block</span>
          </button>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default CalendarScreen;
