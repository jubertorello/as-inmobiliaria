import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';

const SUPER_ADMIN_EMAIL = 'julietabertorello@gmail.com';

interface SessionContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

interface SessionProviderProps {
  children: React.ReactNode;
}

async function checkIsAdmin(user: User | null): Promise<boolean> {
  if (!user?.email) return false;
  if (user.email.toLowerCase() === SUPER_ADMIN_EMAIL) return true;

  const { data, error } = await supabase
    .from('admin_allowlist')
    .select('email')
    .eq('email', user.email.toLowerCase())
    .maybeSingle();

  if (error) return false;
  return Boolean(data?.email);
}

export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const applySession = async (nextSession: Session | null) => {
      const nextUser = nextSession?.user ?? null;
      if (cancelled) return;

      setSession(nextSession);
      setUser(nextUser);

      const nextIsAdmin = await checkIsAdmin(nextUser);
      if (cancelled) return;

      setIsAdmin(nextIsAdmin);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => applySession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setLoading(true);
      void applySession(nextSession);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, user, isAdmin, loading }}>
      {children}
    </SessionContext.Provider>
  );
};