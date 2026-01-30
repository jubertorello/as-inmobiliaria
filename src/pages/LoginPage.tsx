import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useSession } from '../components/SessionProvider';
import SEO from "../../components/SEO";

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { session, loading } = useSession();

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
        <h2 className="text-3xl font-playfair font-bold text-center mb-3 text-gray-900">Acceso a tu Cuenta</h2>
        <p className="text-sm text-gray-500 text-center mb-10">
          Acceso solo por invitación. Si necesitás acceso, solicitáselo a la administradora.
        </p>

        <Auth
          supabaseClient={supabase}
          view="sign_in"
          showLinks={false}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#D95FA2',
                  brandAccent: '#532759',
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
                  borderRadiusButton: '0.75rem',
                  buttonBorderRadius: '0.75rem',
                  inputBorderRadius: '0.75rem',
                },
              },
            },
          }}
          theme="light"
          providers={[]}
          localization={{
            variables: {
              sign_in: {
                email_label: 'Correo electrónico',
                password_label: 'Contraseña',
                email_input_placeholder: 'Tu correo electrónico',
                password_input_placeholder: 'Tu contraseña',
                button_label: 'Iniciar sesión',
              },
              forgotten_password: {
                email_label: 'Correo electrónico',
                email_input_placeholder: 'Tu correo electrónico',
                button_label: 'Enviar instrucciones de recuperación',
                link_text: '¿Olvidaste tu contraseña?',
              },
              update_password: {
                password_label: 'Nueva contraseña',
                password_input_placeholder: 'Tu nueva contraseña',
                button_label: 'Actualizar contraseña',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default LoginPage;