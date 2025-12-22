
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { storeService } from '../storeService';
import { EntryType, Crisis, MedicationEntry, FunctionalImpact } from '../types';

const PAIN_QUALITIES = ['Pulsátil', 'Palpitante', 'Opresivo', 'Punzante', 'Eléctrico'];
const SYMPTOMS_AURA = ['Náuseas', 'Fotofobia', 'Fonofobia', 'Aura visual', 'Vértigo', 'Hormigueo'];

const LOCALIZATIONS_MAP: Record<string, { top: string, left: string }> = {
  'Sien Izq.': { top: '30%', left: '25%' },
  'Sien Der.': { top: '30%', left: '75%' },
  'Ojo Izq.': { top: '40%', left: '38%' },
  'Ojo Der.': { top: '40%', left: '62%' },
  'Occipital': { top: '75%', left: '50%' },
  'Cuello': { top: '90%', left: '50%' },
  'Frontal': { top: '22%', left: '50%' }
};

const CrisisDetailsScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const crisisToEdit = location.state?.crisisToEdit as Crisis | undefined;
  const preFill = location.state?.preFill; // Data from AI
  const isLiteInitial = location.state?.isLite ?? true;

  // Prioritize: Edit > PreFill > Selected Date > Today
  const initialDate = crisisToEdit?.date || preFill?.date || location.state?.selectedDate || new Date().toISOString().split('T')[0];

  const [isLite, setIsLite] = useState(isLiteInitial);
  const [date, setDate] = useState(initialDate);
  const [type, setType] = useState<EntryType>(crisisToEdit?.type || 'Dolor');
  const [isPeriod, setIsPeriod] = useState(crisisToEdit?.isPeriod || false);
  const [startTime, setStartTime] = useState(crisisToEdit?.startTime || preFill?.startTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
  const [endTime, setEndTime] = useState(crisisToEdit?.endTime || preFill?.endTime || '');
  const [intensity, setIntensity] = useState(crisisToEdit?.intensity || preFill?.intensity || 0);
  const [localization, setLocalization] = useState<string[]>(crisisToEdit?.localization || []);
  const [painQuality, setPainQuality] = useState<string[]>(crisisToEdit?.painQuality || []);
  const [symptoms, setSymptoms] = useState<string[]>(crisisToEdit?.symptoms || []);

  // Initialize medications from AI string array if present
  const initialMeds = crisisToEdit?.medications || (preFill?.medications ? preFill.medications.map((m: string) => ({
    id: crypto.randomUUID(),
    name: m,
    dose: '??', // AI might not catch dose always
    time: preFill.startTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    relief: 'Moderado'
  })) : []);

  const [medications, setMedications] = useState<MedicationEntry[]>(initialMeds);
  const [functionalImpact, setFunctionalImpact] = useState<FunctionalImpact>(crisisToEdit?.functionalImpact || 'Nada');
  const [notes, setNotes] = useState(crisisToEdit?.notes || preFill?.notes || '');

  const [showMedForm, setShowMedForm] = useState(false);
  const [tempMed, setTempMed] = useState({ name: '', dose: '' });

  const toggleItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string) => {
    setList(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleAddMed = () => {
    if (!tempMed.name) return;
    const newMed: MedicationEntry = {
      id: crypto.randomUUID(),
      name: tempMed.name,
      dose: tempMed.dose,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
      relief: 'Moderado'
    };
    setMedications([...medications, newMed]);
    setTempMed({ name: '', dose: '' });
    setShowMedForm(false);
  };

  const calculateDuration = () => {
    if (!startTime || !endTime) return "";
    const [h1, m1] = startTime.split(':').map(Number);
    const [h2, m2] = endTime.split(':').map(Number);
    let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (diff < 0) diff += 24 * 60;
    const hours = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hours}h ${mins}m`;
  };

  const handleSave = () => {
    let finalType = type;
    if (intensity > 0) finalType = 'Dolor';
    else if (medications.length > 0) finalType = 'Medicina';
    else if (isPeriod) finalType = 'Periodo';

    const data: Omit<Crisis, 'id'> = {
      date,
      type: finalType,
      startTime,
      endTime,
      intensity,
      localization: isLite ? [] : localization,
      painQuality: isLite ? [] : painQuality,
      symptoms: isLite ? [] : symptoms,
      medications,
      functionalImpact,
      notes,
      isPeriod,
      duration: calculateDuration(),
      medicationName: medications[0]?.name || '',
      medicationAmount: medications[0]?.dose || ''
    };

    if (crisisToEdit) {
      storeService.updateCrisis(crisisToEdit.id, data);
    } else {
      storeService.saveCrisis(data);
    }
    navigate('/calendar');
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col max-w-md mx-auto overflow-x-hidden bg-background-light dark:bg-background-dark font-display pb-20 transition-all duration-300">
      <div className="sticky top-0 z-50 flex items-center bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md p-4 pb-2 justify-between border-b border-slate-100 dark:border-white/5">
        <button onClick={() => navigate(-1)} className="text-slate-500 flex size-12 items-center justify-start">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="text-slate-800 dark:text-white text-lg font-bold flex-1 text-center">Registro {isLite ? 'Rápido' : 'Detallado'}</h2>
        <button onClick={handleSave} className="text-primary font-black uppercase text-xs tracking-widest px-4">Listo</button>
      </div>

      <div className="flex-1 overflow-y-auto pb-10 no-scrollbar p-6 space-y-8">

        {/* Toggle de Modo */}
        <div className="flex bg-slate-100 dark:bg-surface-dark p-1 rounded-2xl">
          <button onClick={() => setIsLite(true)} className={`flex-1 py-3 text-[10px] font-black tracking-widest rounded-xl transition-all ${isLite ? 'bg-white dark:bg-surface-highlight shadow-sm text-primary' : 'text-slate-400'}`}>LITE</button>
          <button onClick={() => setIsLite(false)} className={`flex-1 py-3 text-[10px] font-black tracking-widest rounded-xl transition-all ${!isLite ? 'bg-white dark:bg-surface-highlight shadow-sm text-primary' : 'text-slate-400'}`}>AVANZADO</button>
        </div>

        {/* Sección de Periodo */}
        <section className="fade-in">
          <div className="flex items-center justify-between p-5 bg-rose-50 dark:bg-rose-500/5 rounded-3xl border border-rose-100 dark:border-rose-500/10">
            <div className="flex items-center gap-4">
              <div className={`size-10 rounded-full flex items-center justify-center transition-colors ${isPeriod ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : 'bg-rose-100 dark:bg-rose-900/20 text-rose-300'}`}>
                <span className="material-symbols-outlined text-[20px]">water_drop</span>
              </div>
              <div>
                <p className="text-sm font-bold text-rose-900 dark:text-rose-200">¿Estás con tu periodo?</p>
                <p className="text-[10px] text-rose-400 font-bold uppercase">Ayuda a filtrar migraña hormonal</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={isPeriod} onChange={() => setIsPeriod(!isPeriod)} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-500"></div>
            </label>
          </div>
        </section>

        {/* Tiempos */}
        <section className="grid grid-cols-2 gap-4 fade-in">
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Fecha</p>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white dark:bg-surface-dark border-0 rounded-2xl h-14 font-bold text-sm shadow-soft focus:ring-primary focus:ring-2 appearance-none px-4" />
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Inicio</p>
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full bg-white dark:bg-surface-dark border-0 rounded-2xl h-14 font-bold text-sm shadow-soft focus:ring-primary focus:ring-2 appearance-none px-4" />
          </div>
        </section>

        {/* Intensidad */}
        <section className="fade-in">
          <div className="flex justify-between items-end mb-4 px-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intensidad del Dolor</p>
            <span className={`text-4xl font-black transition-colors ${intensity > 0 ? 'text-slate-600 dark:text-slate-300' : 'text-slate-200 dark:text-slate-700'}`}>{intensity}</span>
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-soft border border-slate-50 dark:border-white/5">
            <input type="range" min="0" max="10" value={intensity} onChange={e => setIntensity(Number(e.target.value))} className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-slate-500 dark:accent-slate-400" />
            <div className="flex justify-between mt-4 text-[9px] font-black text-slate-300 uppercase tracking-tighter">
              <span>Sin dolor</span>
              <span>Moderado</span>
              <span>Incapacidad</span>
            </div>
          </div>
        </section>

        {!isLite && (
          <div className="space-y-8 fade-in">
            {/* Mapa Localización */}
            <section>
              <h3 className="text-lg font-black mb-4 px-2">Localización</h3>
              <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 shadow-soft border border-slate-50 dark:border-white/5 flex flex-col items-center">
                <div className="relative w-full max-w-[180px] aspect-[1/1.2] mb-6 flex items-center justify-center opacity-40 grayscale pointer-events-none">
                  <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUl0v-mmi6IVCVSdHtnnKYDNE21Rq-Mz8UwPk--9yCUf8Ljid4l7I4LPhw8uPwXTrFIlW1H0nvOsanwUMtU1WohQp_WxwW40TKDH3pTpBCEnDr2iY9QqvlbdKjkwSkPmtuY4ssgCgpIBFRMRRBN8zP3KAZCpK_i0sVOM97tuOHxUjqLpEusDPyDh2COiXZqZjAe8XOsJmfRRdWFsvtH1FHZZGyRdoGS14QIGxESUBRczPju-oFwyNOyOOHgQAILx8Vs4Xx9yMsceiN" className="w-full h-full object-contain" alt="Head" />
                  {localization.map(loc => (
                    <div key={loc} className="absolute size-4 bg-primary rounded-full animate-pulse border-2 border-white shadow-lg" style={{ top: LOCALIZATIONS_MAP[loc]?.top, left: LOCALIZATIONS_MAP[loc]?.left, transform: 'translate(-50%, -50%)' }}></div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Object.keys(LOCALIZATIONS_MAP).map(loc => (
                    <button key={loc} onClick={() => toggleItem(localization, setLocalization, loc)} className={`px-4 py-2 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all border ${localization.includes(loc) ? 'bg-primary text-white border-primary shadow-md' : 'bg-slate-50 dark:bg-background-dark text-slate-400 border-slate-100 dark:border-white/5'}`}>{loc}</button>
                  ))}
                </div>
              </div>
            </section>

            {/* Aura y Síntomas */}
            <section className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">Sensaciones</p>
                <div className="flex flex-wrap gap-2">
                  {PAIN_QUALITIES.map(q => (
                    <button key={q} onClick={() => toggleItem(painQuality, setPainQuality, q)} className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all ${painQuality.includes(q) ? 'bg-primary text-white shadow-md' : 'bg-white dark:bg-surface-dark text-slate-500 border border-slate-50 dark:border-white/5'}`}>{q}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">Síntomas adicionales</p>
                <div className="flex flex-wrap gap-2">
                  {SYMPTOMS_AURA.map(s => (
                    <button key={s} onClick={() => toggleItem(symptoms, setSymptoms, s)} className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all ${symptoms.includes(s) ? 'bg-secondary text-white shadow-md' : 'bg-white dark:bg-surface-dark text-slate-500 border border-slate-50 dark:border-white/5'}`}>{s}</button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Medicación */}
        <section className="space-y-4">
          <h3 className="text-lg font-black px-2">Tratamientos</h3>
          <div className="space-y-3">
            {medications.map(med => (
              <div key={med.id} className="flex items-center p-4 bg-white dark:bg-surface-dark rounded-3xl border border-emerald-50 dark:border-emerald-500/10 shadow-soft">
                <div className="size-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mr-4"><span className="material-symbols-outlined">pill</span></div>
                <div className="flex-1 text-sm font-bold">{med.name} <span className="text-slate-400 font-normal">({med.dose})</span></div>
                <button onClick={() => setMedications(medications.filter(m => m.id !== med.id))} className="text-red-400"><span className="material-symbols-outlined">delete</span></button>
              </div>
            ))}
            {showMedForm ? (
              <div className="bg-white dark:bg-surface-dark p-6 rounded-3xl border-2 border-primary/10 space-y-4 fade-in shadow-xl">
                <input placeholder="Medicamento" value={tempMed.name} onChange={e => setTempMed({ ...tempMed, name: e.target.value })} className="w-full bg-slate-50 dark:bg-background-dark border-0 rounded-2xl px-5 py-4 text-sm" />
                <input placeholder="Dosis (ej. 50mg)" value={tempMed.dose} onChange={e => setTempMed({ ...tempMed, dose: e.target.value })} className="w-full bg-slate-50 dark:bg-background-dark border-0 rounded-2xl px-5 py-4 text-sm" />
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowMedForm(false)} className="flex-1 py-4 text-xs font-black text-slate-400">CANCELAR</button>
                  <button onClick={handleAddMed} className="flex-1 py-4 bg-primary text-white rounded-2xl text-xs font-black tracking-widest shadow-lg shadow-primary/20">AÑADIR</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowMedForm(true)} className="w-full py-5 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-3xl text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/50 transition-colors">
                + Añadir tratamiento
              </button>
            )}
          </div>
        </section>

        {/* Impacto */}
        <section>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-3">Impacto Funcional</p>
          <div className="flex bg-slate-100 dark:bg-surface-dark p-1 rounded-2xl">
            {(['Nada', 'Limitado', 'Postración'] as FunctionalImpact[]).map(impact => (
              <button key={impact} onClick={() => setFunctionalImpact(impact)} className={`flex-1 py-3 text-[10px] font-black tracking-widest rounded-xl transition-all ${functionalImpact === impact ? 'bg-white dark:bg-surface-highlight shadow-sm text-primary' : 'text-slate-400'}`}>{impact.toUpperCase()}</button>
            ))}
          </div>
        </section>

        <section>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notas adicionales o factores ambientales..." className="w-full bg-white dark:bg-surface-dark border-0 rounded-3xl p-5 text-sm shadow-soft focus:ring-2 focus:ring-primary min-h-[120px]" />
        </section>
      </div>
    </div>
  );
};

export default CrisisDetailsScreen;
