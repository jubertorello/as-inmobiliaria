import React from 'react';
import SEO from '../components/SEO';
import { supabase } from '../integrations/supabase/client';

const BootstrapAdmin: React.FC = () => {
  // Extra safety: even if someone manually adds the route back, keep this page disabled in production.
  if (import.meta.env.PROD) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-gray-50 px-4 py-12">
        <SEO title="Not Found" robots="noindex" />
        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md text-center">
          <h1 className="text-2xl font-playfair font-bold text-gray-900">Página no disponible</h1>
          <p className="text-sm text-gray-500 mt-2">Bootstrap está deshabilitado en producción.</p>
        </div>
      </div>
    );
  }

  const [token, setToken] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const run = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('bootstrap-superadmin', {
        body: { token },
      });

      if (error) {
        setResult({ type: 'error', message: error.message });
        return;
      }

      setResult({
        type: 'success',
        message: data?.created
          ? 'Superadmin creado. Ya podés iniciar sesión.'
          : 'El superadmin ya existía. Bootstrap completado (no se resetean contraseñas).',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <SEO title="Bootstrap Admin" robots="noindex" />
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md">
        <h1 className="text-2xl font-playfair font-bold text-gray-900 text-center mb-2">Inicializar Superadmin</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Esto crea una única vez el usuario <span className="font-semibold">julietabertorello@gmail.com</span> y luego bloquea el bootstrap.
        </p>

        {result && (
          <div
            className={`mb-6 rounded-2xl px-4 py-3 text-sm ${result.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-100'
                : 'bg-red-50 text-red-700 border border-red-100'
              }`}
          >
            {result.message}
          </div>
        )}

        <form onSubmit={run} className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bootstrap token</label>
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Pegá el token"
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-brand-pink text-white font-bold rounded-xl uppercase tracking-widest shadow-xl hover:bg-brand-dark transition-all disabled:opacity-70"
          >
            {loading ? 'Procesando...' : 'Inicializar'}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-6">
          Nota: la contraseña inicial no está hardcodeada; se toma del secreto <span className="font-semibold">SUPER_ADMIN_PASSWORD</span> en el servidor. Si necesitás cambiar la contraseña, hacelo desde Supabase o usando "Olvidé mi contraseña".
        </p>
      </div>
    </div>
  );
};

export default BootstrapAdmin;