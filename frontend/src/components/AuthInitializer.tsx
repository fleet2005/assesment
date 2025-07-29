'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/auth-store';

export default function AuthInitializer() {
  const [isInitialized, setIsInitialized] = useState(false);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // Initialize auth state from localStorage only on client side
    if (typeof window !== 'undefined') {
      initializeAuth();
      setIsInitialized(true);
    }
  }, [initializeAuth]);

  // Don't render anything until initialized to prevent hydration mismatch
  if (!isInitialized) {
    return null;
  }

  return null;
} 