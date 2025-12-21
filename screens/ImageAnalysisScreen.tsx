
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gemini } from '../geminiService';
import BottomNav from '../components/BottomNav';

const ImageAnalysisScreen: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyze = async () => {
    if (!image) return;
    setIsLoading(true);
    try {
      const base64 = image.split(',')[1];
      const result = await gemini.analyzeImage(base64, "Analiza esta imagen relacionada con la migraña. Si es un informe, resume los hallazgos. Si es comida, indica posibles desencadenantes comunes. Responde en español de forma profesional.");
      setAnalysis(result || "No se pudo generar un análisis.");
    } catch (error) {
      setAnalysis("Error al analizar la imagen.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark pb-20 overflow-hidden">
      <header className="flex items-center px-4 py-4 pt-6 bg-white dark:bg-surface-dark shadow-sm z-10">
        <button onClick={() => navigate(-1)} className="text-slate-500 dark:text-slate-400 p-2">
          <span className="material-symbols-outlined">arrow_back_ios_new</span>
        </button>
        <h2 className="text-lg font-bold flex-1 text-center pr-8">Análisis Visual IA</h2>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar">
        {!image ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-white/50 dark:bg-surface-dark/50">
            <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-4">image_search</span>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 px-8 text-center">Sube un informe médico, foto de tu comida o diario de dolor para analizar.</p>
            <label className="bg-primary text-white px-6 py-2 rounded-xl font-bold cursor-pointer hover:bg-primary-hover transition-colors">
              Elegir Foto
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        ) : (
          <div className="space-y-6 fade-in">
            <div className="relative group rounded-2xl overflow-hidden shadow-lg">
              <img src={image} alt="Uploaded" className="w-full object-cover max-h-64" />
              <button 
                onClick={() => {setImage(null); setAnalysis(null);}} 
                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            {!analysis && !isLoading && (
              <button 
                onClick={analyze}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all"
              >
                Analizar con IA
              </button>
            )}

            {isLoading && (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-primary font-medium">Analizando patrones...</p>
              </div>
            )}

            {analysis && (
              <div className="bg-white dark:bg-surface-dark p-6 rounded-2xl border border-primary/10 shadow-soft space-y-3 fade-in">
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined">auto_awesome</span>
                  <h3 className="font-bold">Resultado del Análisis</h3>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {analysis}
                </p>
                <button 
                  onClick={() => navigate('/chat')}
                  className="w-full mt-4 text-primary text-sm font-bold flex items-center justify-center gap-2 border border-primary/20 py-2 rounded-lg hover:bg-primary/5"
                >
                  Hablar con el asistente <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ImageAnalysisScreen;
