'use client';

import { useEffect } from 'react';
import { useAuth } from '@/store/authStore';

export default function AuthBootstrap() {
  const { hydrated, initializeAuth } = useAuth();

  useEffect(() => {
    if (hydrated) {
      void initializeAuth();
    }
  }, [hydrated, initializeAuth]);

  return null;
}
