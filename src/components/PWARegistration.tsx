'use client';

import { useEffect } from 'react';

export function PWARegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Discipline-OS SW registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('Discipline-OS SW registration failed:', error);
          });
      });
    }
  }, []);

  return null;
}
