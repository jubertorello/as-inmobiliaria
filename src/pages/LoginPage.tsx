import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../components/SessionProvider';
import SEO from '../components/SEO';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, loading } = useSession();

  // Redirect authenticated users to the home page
  React.useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-brand-pinkLight border-t-brand-pink rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4 py-12">
      <SEO title="Iniciar Sesión" robots="noindex" />
      <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md">
        <h2 className="text-3xl font-playfair font-bold text-center mb-10 text-gray-900">Acceso a tu Cuenta</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#D95FA2', // brand-pink
                  brandAccent: '#532759', // brand-dark
                  defaultButtonBackground: '#F2F2F2',
                  defaultButtonBackgroundHover: '#E5E5E5',
                  defaultButtonBorder: '#E5E5E5',
                  inputBackground: '#F9FAFB',
                  inputBorder: '#E5E7EB',
                  inputBorderHover: '#D1D5DB',
                  inputBorderFocus: '#D95FA2',
                  inputText: '#1F2937',
                  inputPlaceholder: '#9CA3AF',
                },
                radii: {
                  borderRadiusButton: '0.75rem', // rounded-xl
                  buttonBorderRadius: '0.75rem', // rounded-xl
                  inputBorderRadius: '0.75rem', // rounded-xl
                },
              },
            },
          }}
          theme="light"
          providers={[]} // No social providers for now
          magicLink={true} // Enable magic link for passwordless login
          localization={{
            variables: {
              sign_in: {
                email_label: 'Correo electrónico',
                password_label: 'Contraseña',
                email_input_placeholder: 'Tu correo electrónico',
                password_input_placeholder: 'Tu contraseña',
                button_label: 'Iniciar sesión',
                social_auth_typography: 'O inicia sesión con',
                link_text: '¿Ya tienes una cuenta? Inicia sesión',
                no_account_row: '¿No tienes una cuenta?',
                sign_up_link: 'Regístrate',
              },
              sign_up: {
                email_label: 'Correo electrónico',
                password_label: 'Contraseña',
                email_input_placeholder: 'Tu correo electrónico',
                password_input_placeholder: 'Crea una contraseña',
                button_label: 'Registrarse',
                social_auth_typography: 'O regístrate con',
                link_text: '¿No tienes una cuenta? Regístrate',
                have_account_row: '¿Ya tienes una cuenta?',
                sign_in_link: 'Inicia sesión',
              },
              forgotten_password: {
                email_label: 'Correo electrónico',
                password_label: 'Contraseña',
                email_input_placeholder: 'Tu correo electrónico',
                button_label: 'Enviar instrucciones de recuperación',
                link_text: '¿Olvidaste tu contraseña?',
              },
              update_password: {
                password_label: 'Nueva contraseña',
                password_input_placeholder: 'Tu nueva contraseña',
                button_label: 'Actualizar contraseña',
              },
              magic_link: {
                email_input_placeholder: 'Tu correo electrónico',
                button_label: 'Enviar enlace mágico',
                link_text: 'Enviar un enlace mágico',
                email_link_sent: 'Revisa tu correo para el enlace mágico',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;