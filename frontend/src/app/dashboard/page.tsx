'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import QueueManagement from '@/components/dashboard/QueueManagement';
import AvailableDoctors from '@/components/dashboard/AvailableDoctors';
import AppointmentManagement from '@/components/dashboard/AppointmentManagement';

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('queue');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router, isClient]);

  // Don't render until client-side to prevent hydration mismatch
  if (!isClient) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-600">Loading...</div>
    </div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-gray-600">Manage your clinic operations</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('queue')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'queue'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Queue Management
              </button>
              <button
                onClick={() => setActiveTab('doctors')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'doctors'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Available Doctors
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'appointments'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Appointment Management
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'queue' && <QueueManagement />}
            {activeTab === 'doctors' && <AvailableDoctors />}
            {activeTab === 'appointments' && <AppointmentManagement />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 