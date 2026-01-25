import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const setLoadingSafe = (value: boolean) => {
      if (!cancelled) setIsLoading(value);
    };

    const fetchAdminRole = async (userId: string) => {
      try {
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        if (cancelled) return;
        if (error) {
          setIsAdmin(false);
          return;
        }

        setIsAdmin(roles?.some((r: { role: string }) => r.role === 'admin') ?? false);
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    };

    // Set up auth state listener BEFORE checking session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (cancelled) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      // On ne bloque pas l'UI sur la récupération du rôle
      setLoadingSafe(false);
      setIsAdmin(false);

      if (nextSession?.user) {
        void fetchAdminRole(nextSession.user.id);
      }
    });

    // Check initial session (ne doit jamais laisser isLoading à true)
    (async () => {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (cancelled) return;
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setIsAdmin(false);

        if (initialSession?.user) {
          void fetchAdminRole(initialSession.user.id);
        }
      } finally {
        setLoadingSafe(false);
      }
    })();

    // Fallback anti-blocage (réseau / stockage)
    const timeoutId = window.setTimeout(() => setLoadingSafe(false), 4000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isAdmin, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
