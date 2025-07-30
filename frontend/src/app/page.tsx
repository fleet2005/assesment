'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import { Stethoscope, Activity, Heart } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, router, isClient]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
      <div className="text-center animate-fadeIn">
        <div className="w-24 h-24 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-glow">
          <Stethoscope className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Clinic Manager
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
          Streamlining healthcare operations with modern technology
        </p>
        
        <div className="flex items-center justify-center space-x-8 mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Loading...</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-6 text-gray-400">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span className="text-xs">Queue Management</span>
          </div>
          <div className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span className="text-xs">Patient Care</span>
          </div>
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-4 w-4" />
            <span className="text-xs">Doctor Schedules</span>
          </div>
        </div>
      </div>
    </div>
  );
} 