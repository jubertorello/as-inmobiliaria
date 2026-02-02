import React from 'react';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../components/SessionProvider';
import SEO from "../../components/SEO";

type AuthView = 'sign_in' | 'forgotten_password' | 'update_password';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, loading } = useSession();

  const [view, setView] = React.useState<AuthView>('sign_in');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [status, setStatus] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    // If user comes from password recovery email, Supabase uses the hash fragment with type=recovery
    const hash = (window.location.hash || '').toLowerCase();
    if (hash.includes('type=recovery')) {
      setView('update_password');
    }
  }, []);

  React.useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  const onSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setStatus({ type: 'error', text: 'Ingresá email y contraseña.' });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        setStatus({ type: 'error', text: error.message });
        return;
      }

      setStatus({ type: 'success', text: 'Ingreso exitoso.' });
      // SessionProvider will redirect
    } finally {
      setSending(false);
    }
  };

  const onForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setStatus({ type: 'error', text: 'Ingresá tu correo electrónico.' });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        setStatus({ type: 'error', text: error.message });
        return;
      }

      setStatus({ type: 'success', text: 'Te enviamos un email para recuperar tu contraseña.' });
    } finally {
      setSending(false);
    }
  };

  const onUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (!newPassword.trim()) {
      setStatus({ type: 'error', text: 'Ingresá tu nueva contraseña.' });
      return;
    }

    setSending(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) {
        setStatus({ type: 'error', text: error.message });
        return;
      }

      setNewPassword('');
      setStatus({ type: 'success', text: 'Contraseña actualizada. Ya podés ingresar.' });
      setView('sign_in');
      window.location.hash = '';
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-brand-pinkLight border-t-brand-pink rounded-full animate-spin"></div>
      </div>
    );
  }

  const PasswordField = (props: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
  }) => (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{props.label}</label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          required
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          placeholder={props.placeholder}
          autoComplete={view === 'update_password' ? 'new-password' : 'current-password'}
          className="w-full bg-gray-50 border border-gray-100 rounded-2xl pl-6 pr-14 py-4 text-gray-900 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-white transition-colors"
          aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          title={showPassword ? 'Ocultar' : 'Mostrar'}
        >
          <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <SEO title="Iniciar Sesión" robots="noindex" />
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md">
        <h2 className="text-3xl font-playfair font-bold text-center mb-3 text-gray-900">Acceso a tu Cuenta</h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          {view === 'forgotten_password'
            ? 'Te enviamos un email para recuperar tu contraseña.'
            : view === 'update_password'
              ? 'Elegí tu nueva contraseña.'
              : 'Ingresá con tu email y contraseña.'}
        </p>

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

        {view === 'sign_in' && (
          <form onSubmit={onSignIn} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                autoComplete="email"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
              />
            </div>

            <PasswordField
              label="Contraseña"
              value={password}
              onChange={setPassword}
              placeholder="Tu contraseña"
            />

            <button
              type="submit"
              disabled={sending}
              className="w-full py-5 bg-brand-pink text-white font-bold rounded-2xl uppercase tracking-[0.2em] shadow-xl hover:bg-brand-dark transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {sending ? 'Ingresando...' : 'Iniciar sesión'}
            </button>
          </form>
        )}

        {view === 'forgotten_password' && (
          <form onSubmit={onForgotPassword} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Tu correo electrónico"
                autoComplete="email"
                className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-gray-900 outline-none focus:ring-2 focus:ring-brand-pink/20 focus:border-brand-pink"
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full py-5 bg-brand-pink text-white font-bold rounded-2xl uppercase tracking-[0.2em] shadow-xl hover:bg-brand-dark transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {sending ? 'Enviando...' : 'Enviar email de recuperación'}
            </button>
          </form>
        )}

        {view === 'update_password' && (
          <form onSubmit={onUpdatePassword} className="space-y-6">
            <PasswordField
              label="Nueva contraseña"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Tu nueva contraseña"
            />

            <button
              type="submit"
              disabled={sending}
              className="w-full py-5 bg-brand-pink text-white font-bold rounded-2xl uppercase tracking-[0.2em] shadow-xl hover:bg-brand-dark transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {sending ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        )}

        <div className="mt-6 flex flex-col gap-2 text-center">
          {view === 'sign_in' ? (
            <button
              type="button"
              onClick={() => setView('forgotten_password')}
              className="text-xs font-bold uppercase tracking-widest text-brand-pink hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          ) : view === 'forgotten_password' ? (
            <button
              type="button"
              onClick={() => setView('sign_in')}
              className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-700"
            >
              Volver a iniciar sesión
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setView('sign_in')}
              className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-gray-700"
            >
              Volver
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;