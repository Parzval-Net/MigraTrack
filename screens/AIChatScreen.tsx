
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { gemini } from '../geminiService';
import { Message } from '../types';
import BottomNav from '../components/BottomNav';
import ChatMessage from '../components/ChatMessage';

const AIChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '¡Hola! Soy MigraCare. Puedo ayudarte a analizar tus síntomas o sugerirte ejercicios de respiración. ¿Cómo te sientes hoy?' }
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

        // Check for actions in the accumulating text
        let displayOne = fullText;
        const actionMatch = fullText.match(/\[\[ACTION:([a-zA-Z0-9_:-]+)\]\]/);

        if (actionMatch) {
          const actionCode = actionMatch[1];
          // Remove the tag from the displayed message
          displayOne = fullText.replace(actionMatch[0], '').trim();

          // Execute Action (Debounced check could be adding but for now direct is fine as it renders once)
          // We'll execute strictly when stream ends or use a flag to prevent double exec
          // But doing it here might trigger multiple times. Ideally we do it in 'finally' or check if already executed.
        }

        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'model', text: displayOne };
          return updated;
        });
      }

      // Execute Action Logic AFTER text is fully received to avoid jitter
      const prefillMatch = fullText.match(/\[\[ACTION:PREFILL_LOG:(.*)\]\]/);
      const navMatch = fullText.match(/\[\[ACTION:NAVIGATE:(.*)\]\]/);

      if (prefillMatch) {
        try {
          const jsonStr = prefillMatch[1];
          const data = JSON.parse(jsonStr);
          setTimeout(() => {
            navigate('/crisis-details', { state: { preFill: data, isLite: false } }); // Force detailed view for auto-fill
          }, 1500);
        } catch (e) {
          console.error("Error parsing prefill data", e);
        }
      } else if (navMatch) {
        const route = navMatch[1];
        setTimeout(() => {
          navigate(route);
        }, 1500);
      } else {
        // Legacy fallback (can likely remove if prompt is strict, but keeping for safety)
        const finalActionMatch = fullText.match(/\[\[ACTION:([a-zA-Z0-9_:-]+)\]\]/);
        if (finalActionMatch && !finalActionMatch[1].startsWith('PREFILL') && !finalActionMatch[1].startsWith('NAVIGATE')) {
          // ... legacy logic if any ...
        }
      }
    } catch (error: any) {
      console.error(error);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'model', text: `Error: ${error.message || 'Problema desconocido'}` };
        return updated;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-background-light dark:bg-background-dark pb-[80px] overflow-hidden supports-[height:100dvh]:h-[100dvh]">
      <header className="flex items-center px-4 py-4 pt-6 bg-white dark:bg-surface-dark shadow-sm z-10 border-b border-slate-50 dark:border-white/5">
        <button onClick={() => navigate(-1)} className="text-slate-500 dark:text-slate-400 p-2">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex-1 flex flex-col items-center">
          <h2 className="text-sm font-bold">Asistente MigraCare</h2>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">En línea</span>
          </div>
        </div>
        <div className="w-10"></div>
      </header>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6 no-scrollbar bg-[#fff9fa]/50 dark:bg-background-dark">
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} msg={msg} />
        ))}
      </div>

      <div className="p-3 bg-white dark:bg-surface-dark border-t border-slate-100 dark:border-white/5 flex gap-2 items-center shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Describe tus síntomas..."
          className="flex-1 bg-slate-50 dark:bg-background-dark border-none rounded-2xl px-5 py-3.5 focus:ring-2 focus:ring-primary text-base shadow-inner"
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
