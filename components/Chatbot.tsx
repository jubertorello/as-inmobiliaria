
import React, { useState, useRef, useEffect } from 'react';
import { Property, Message } from '../types';
import { getAIResponse } from '../geminiService';
import { BRAND_COLOR } from '../constants';

interface ChatbotProps {
  properties: Property[];
}

const Chatbot: React.FC<ChatbotProps> = ({ properties }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '¡Hola! Soy Andrea Sartori. Es un placer saludarte. ¿Estás buscando tu próximo hogar o quizás una oportunidad de inversión? Cuéntame qué tienes en mente.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ANDREA_AVATAR = "avatar-andrea.png";
  const FALLBACK_AVATAR = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=256";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const response = await getAIResponse(userMsg, properties);
      setMessages(prev => [...prev, { role: 'model', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Disculpa, he tenido un inconveniente técnico momentáneo. ¿Podrías contactarme por WhatsApp para darte una atención personalizada?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-80 sm:w-96 flex flex-col h-[520px] overflow-hidden animate-in slide-in-from-bottom-6 duration-500">
          <div className="p-5 flex items-center justify-between border-b shadow-sm bg-brand-pink">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-white overflow-hidden border-2 border-white/50 shadow-md">
                  <img 
                    src={ANDREA_AVATAR} 
                    alt="Andrea Sartori" 
                    className="w-full h-full object-cover"
                    onError={(e) => { 
                      const target = e.target as HTMLImageElement;
                      if (target.src.indexOf('avatar-andrea.png') !== -1) {
                        target.src = FALLBACK_AVATAR;
                      }
                    }}
                  />
                </div>
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-base leading-tight">Andrea Sartori</span>
                <span className="text-white/80 text-[10px] uppercase tracking-widest font-medium mt-0.5">Asesoría Personalizada</span>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white/70 hover:text-white transition-all p-1.5 hover:bg-white/10 rounded-full flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-2xl">close</span>
            </button>
          </div>

          <div ref={scrollRef} className="flex-grow p-5 overflow-y-auto space-y-4 bg-gray-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-brand-pink text-white rounded-tr-none' 
                    : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none font-medium'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-brand-pink/30 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-brand-pink/60 rounded-full animate-pulse delay-75"></div>
                    <div className="w-2 h-2 bg-brand-pink rounded-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-white">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Escribe tu consulta aquí..."
                className="flex-grow border border-gray-200 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink transition-all"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="p-3.5 rounded-2xl text-white transition-all bg-brand-pink hover:bg-brand-dark hover:scale-105 disabled:opacity-50 shadow-lg active:scale-95 flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group w-18 h-18 rounded-full shadow-2xl overflow-hidden border-4 border-white transform hover:scale-110 transition-all duration-500 ring-4 ring-brand-pinkLight/30 bg-brand-pink"
          style={{ width: '4.5rem', height: '4.5rem' }}
        >
          <img 
            src={ANDREA_AVATAR} 
            alt="Abrir Chat" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => { 
              const target = e.target as HTMLImageElement;
              if (target.src.indexOf('avatar-andrea.png') !== -1) {
                target.src = FALLBACK_AVATAR;
              }
            }}
          />
          <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-md"></div>
        </button>
      )}
    </div>
  );
};

export default Chatbot;
