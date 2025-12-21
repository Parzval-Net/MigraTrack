
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gemini } from '../geminiService';
import { Message } from '../types';
import BottomNav from '../components/BottomNav';

const AIChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '¡Hola! Soy Alivio. Puedo ayudarte a analizar tus síntomas o sugerirte ejercicios de respiración. ¿Cómo te sientes hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Placeholder para el mensaje que se va a streamear
    const modelMsg: Message = { role: 'model', text: '' };
    setMessages(prev => [...prev, modelMsg]);

    try {
      const stream = gemini.chatStream(input);
      let fullText = '';
      
      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'model', text: fullText };
          return updated;
        });
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'model', text: 'Lo siento, he tenido un problema de conexión. ¿Podrías repetir?' };
        return updated;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark pb-20 overflow-hidden">
      <header className="flex items-center px-4 py-4 pt-6 bg-white dark:bg-surface-dark shadow-sm z-10 border-b border-slate-50 dark:border-white/5">
        <button onClick={() => navigate(-1)} className="text-slate-500 dark:text-slate-400 p-2">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1 flex flex-col items-center">
          <h2 className="text-sm font-bold">Asistente Alivio</h2>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">En línea</span>
          </div>
        </div>
        <div className="w-10"></div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar bg-[#fff9fa]/50 dark:bg-background-dark">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} fade-in`}>
            <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'bg-white dark:bg-surface-dark text-slate-800 dark:text-white rounded-tl-none border border-slate-100 dark:border-white/5'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text || '...'}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-white/5 flex gap-2 items-center">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Describe tus síntomas..."
          className="flex-1 bg-slate-50 dark:bg-background-dark border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-primary text-sm shadow-inner"
        />
        <button 
          onClick={handleSend}
          disabled={!input.trim() || isTyping}
          className="bg-primary text-white size-12 rounded-2xl hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined">send</span>
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default AIChatScreen;
