
import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const INITIAL_NOTIFICATIONS = [
    { id: 1, title: 'Recordatorio de Hidratación', msg: 'No olvides beber agua. Tu meta es 2.5L hoy.', time: 'Hace 2h', icon: 'water_drop', color: 'text-blue-500', unread: true },
    { id: 2, title: 'Registro Pendiente', msg: '¿Cómo te sientes esta tarde? Registra tu estado.', time: 'Hace 5h', icon: 'edit_note', color: 'text-primary', unread: true },
    { id: 3, title: 'Análisis Semanal', msg: 'Tu resumen de bienestar está listo.', time: 'Ayer', icon: 'monitoring', color: 'text-secondary', unread: false },
];

const NotificationsScreen: React.FC = () => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = React.useState(INITIAL_NOTIFICATIONS);

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    };

    const deleteNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark pb-20 font-display">
            <header className="flex items-center px-4 py-4 pt-6 bg-white dark:bg-surface-dark shadow-sm z-10">
                <button onClick={() => navigate(-1)} className="text-slate-500 dark:text-slate-400 p-2">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h2 className="text-lg font-bold flex-1 text-center pr-8 text-slate-800 dark:text-white">Notificaciones</h2>
                {notifications.length > 0 && (
                    <button onClick={() => setNotifications([])} className="text-[10px] font-black uppercase tracking-widest text-slate-400">Limpiar</button>
                )}
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.length > 0 ? notifications.map(n => (
                    <div
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`relative bg-white dark:bg-card-dark p-4 rounded-2xl shadow-soft border  transition-all fade-in group ${n.unread ? 'border-l-4 border-l-primary border-y-slate-50 border-r-slate-50 dark:border-y-white/5 dark:border-r-white/5' : 'border-slate-50 dark:border-white/5 opacity-80'}`}
                    >
                        <div className="flex gap-4 items-start">
                            <div className={`p-3 rounded-xl bg-slate-50 dark:bg-white/5 ${n.color}`}>
                                <span className="material-symbols-outlined">{n.icon}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h4 className={`font-bold text-sm ${n.unread ? 'text-slate-800 dark:text-white' : 'text-slate-500'}`}>{n.title}</h4>
                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">{n.time}</span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{n.msg}</p>
                            </div>
                        </div>

                        {/* Delete Button (Visible on hover/focus implies mobile needs direct action, so we add a dedicated small X) */}
                        <button
                            onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                            className="absolute -top-2 -right-2 bg-slate-200 dark:bg-slate-700 text-slate-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                    </div>
                )) : (
                    <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                        <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">notifications_off</span>
                        <p className="text-slate-400 font-medium">No tienes notificaciones nuevas</p>
                    </div>
                )}

                <BottomNav />
            </div>
            );
};

            export default NotificationsScreen;
