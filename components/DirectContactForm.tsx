import React from 'react';
import { supabase } from '../src/integrations/supabase/client';

const DirectContactForm: React.FC = () => {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [status, setStatus] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sending, setSending] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanPhone || !cleanMessage) {
      setStatus({ type: 'error', text: 'Completá nombre, teléfono y mensaje.' });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('contact-direct', {
        body: { name: cleanName, phone: cleanPhone, message: cleanMessage },
      });

      if (error) {
        setStatus({ type: 'error', text: 'No pudimos enviar el mensaje. Intentá nuevamente.' });
        return;
      }

      setName('');
      setPhone('');
      setMessage('');
      setStatus({ type: 'success', text: 'Mensaje enviado. ¡Gracias!' });
    } catch {
      setStatus({ type: 'error', text: 'No pudimos enviar el mensaje. Intentá nuevamente.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl">
      <h3 className="text-gray-900 font-bold mb-8 uppercase tracking-[0.2em] text-[10px]">Consultas Directas</h3>

      {status && (
        <div
          className={`mb-6 rounded-2xl px-4 py-3 text-sm border ${
            status.type === 'success'
              ? 'bg-green-50 text-green-700 border-green-100'
              : 'bg-red-50 text-red-700 border-red-100'
          }`}
        >
          {status.text}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Tu Nombre</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Teléfono</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mensaje</label>
          <textarea
            required
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
          />
        </div>

        <button
          type="submit"
          disabled={sending}
          className="w-full py-5 bg-brand-pink text-white font-bold rounded-2xl uppercase tracking-[0.2em] shadow-xl hover:bg-brand-dark transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {sending ? 'Enviando...' : 'Enviar Mensaje'}
        </button>
      </form>
    </div>
  );
};

export default DirectContactForm;
