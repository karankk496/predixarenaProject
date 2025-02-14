'use client';

import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if we're in the browser
      window.addEventListener('unhandledrejection', (event) => {
        console.error('Unhandled promise rejection:', event.reason);
      });
    }
  }, []);

  return <SessionProvider>{children}</SessionProvider>;
} 