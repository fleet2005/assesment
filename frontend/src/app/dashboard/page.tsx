'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/stores/auth-store';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import QueueManagement from '@/components/dashboard/QueueManagement';
import AvailableDoctors from '@/components/dashboard/AvailableDoctors';
import AppointmentManagement from '@/components/dashboard/AppointmentManagement';
import { Clock, Users, Calendar, TrendingUp, Activity } from 'lucide-react';
import api from '@/lib/api';

interface DashboardStats {
  queueStats: {
    total: number;
    waiting: number;
    withDoctor: number;
    completed: number;
  };
  doctorStats: {
    total: number;
    available: number;
    busy: number;
    offDuty: number;
  };
  appointmentStats: {
    total: number;
    scheduled: number;
    confirmed: number;
    inProgress: number;
    completed: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('queue');
  const [isClient, setIsClient] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    queueStats: { total: 0, waiting: 0, withDoctor: 0, completed: 0 },
    doctorStats: { total: 0, available: 0, busy: 0, offDuty: 0 },
    appointmentStats: { total: 0, scheduled: 0, confirmed: 0, inProgress: 0, completed: 0 }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      if (isAuthenticated) {
        loadDashboardStats();
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, router, isClient]);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      
      // Fetch queue data
      const queueResponse = await api.get('/queue');
      const queueItems = queueResponse.data || [];
      
      // Fetch doctors data
      const doctorsResponse = await api.get('/doctors');
      const doctors = doctorsResponse.data.doctors || doctorsResponse.data || [];
      
      // Fetch appointments data
      const appointmentsResponse = await api.get('/appointments');
      const appointments = appointmentsResponse.data.appointments || appointmentsResponse.data || [];
      
      // Calculate stats
      const queueStats = {
        total: queueItems.length,
        waiting: queueItems.filter((item: any) => item.status === 'waiting').length,
        withDoctor: queueItems.filter((item: any) => item.status === 'with_doctor').length,
        completed: queueItems.filter((item: any) => item.status === 'completed').length,
      };
      
      const doctorStats = {
        total: doctors.length,
        available: doctors.filter((doctor: any) => doctor.status === 'available').length,
        busy: doctors.filter((doctor: any) => doctor.status === 'busy').length,
        offDuty: doctors.filter((doctor: any) => doctor.status === 'off_duty').length,
      };
      
      const appointmentStats = {
        total: appointments.length,
        scheduled: appointments.filter((apt: any) => apt.status === 'scheduled').length,
        confirmed: appointments.filter((apt: any) => apt.status === 'confirmed').length,
        inProgress: appointments.filter((apt: any) => apt.status === 'in_progress').length,
        completed: appointments.filter((apt: any) => apt.status === 'completed').length,
      };
      
      setStats({ queueStats, doctorStats, appointmentStats });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render until client-side to prevent hydration mismatch
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner spinner-lg mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const tabs = [
    {
      id: 'queue',
      name: 'Queue Management',
      icon: Clock,
      description: 'Manage patient queue and priorities',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'doctors',
      name: 'Available Doctors',
      icon: Users,
      description: 'View and manage doctor schedules',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'appointments',
      name: 'Appointment Management',
      icon: Calendar,
      description: 'Schedule and manage appointments',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-600 rounded-3xl p-8 text-white shadow-large">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-xl text-white/90 mb-6">
                Here's what's happening at your clinic today
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm font-medium">Patients in Queue</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? '...' : stats.queueStats.total}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Clock className="h-6 w-6" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm font-medium">Available Doctors</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? '...' : stats.doctorStats.available}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/70 text-sm font-medium">Today's Appointments</p>
                      <p className="text-2xl font-bold">
                        {isLoading ? '...' : stats.appointmentStats.total}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                <Activity className="h-16 w-16 text-white/60" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50/50">
            <nav className="flex space-x-1 p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center py-4 px-6 rounded-2xl font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-glow`
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mb-2 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <span className="font-semibold">{tab.name}</span>
                    <span className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                      {tab.description}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === 'queue' && <QueueManagement onStatsUpdate={loadDashboardStats} />}
            {activeTab === 'doctors' && <AvailableDoctors onStatsUpdate={loadDashboardStats} />}
            {activeTab === 'appointments' && <AppointmentManagement onStatsUpdate={loadDashboardStats} />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 