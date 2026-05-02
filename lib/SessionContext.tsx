'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface Session {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType>({
  session: null,
  isLoading: true,
  refreshSession: async () => {},
});

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        setSession(await res.json());
      } else {
        setSession(null);
      }
    } catch (err) {
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <SessionContext.Provider value={{ session, isLoading, refreshSession: fetchSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);
