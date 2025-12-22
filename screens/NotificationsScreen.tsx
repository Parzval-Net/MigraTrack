
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const NOTIFICATIONS = [
    { id: 1, title: 'Recordatorio de Hidratación', msg: 'No olvides beber agua. Tu meta es 2.5L hoy.', time: 'Hace 2h', icon: 'water_drop', color: 'text-blue-500' },
    { id: 2, title: 'Registro Pendiente', msg: '¿Cómo te sientes esta tarde? Registra tu estado.', time: 'Hace 5h', icon: 'edit_note', color: 'text-primary' },
    { id: 3, title: 'Análisis Semanal', msg: 'Tu resumen de bienestar está listo.', time: 'Ayer', icon: 'monitoring', color: 'text-secondary' },
];

const NotificationsScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark pb-20 font-display">
            <header className="flex items-center px-4 py-4 pt-6 bg-white dark:bg-surface-dark shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="text-slate-500 dark:text-slate-400 p-2">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold flex-1 text-center pr-8 text-slate-800 dark:text-white">Notificaciones</h2>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {NOTIFICATIONS.map(n => (
                    <div key={n.id} className="bg-white dark:bg-card-dark p-4 rounded-2xl shadow-soft border border-slate-50 dark:border-white/5 flex gap-4 items-start fade-in">
                        <div className={`p-3 rounded-xl bg-slate-50 dark:bg-white/5 ${n.color}`}>
                            <span className="material-symbols-outlined">{n.icon}</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-slate-800 dark:text-white text-sm">{n.title}</h4>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{n.time}</span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.msg}</p>
                        </div>
                    </div>
                ))}

                <div className="p-8 text-center">
                    <p className="text-xs text-slate-400 font-medium">No hay más notificaciones recientes.</p>
                </div>
            </div>

            <BottomNav />
        </div>
    );
};

export default NotificationsScreen;
