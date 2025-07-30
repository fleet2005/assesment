'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Menu, 
  X, 
  Users, 
  Calendar, 
  Clock, 
  LogOut, 
  User,
  Stethoscope,
  Home,
  Settings,
  Bell,
  Search
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Overview and analytics' },
    { name: 'Queue Management', href: '/dashboard?tab=queue', icon: Clock, description: 'Manage patient queue' },
    { name: 'Doctors', href: '/dashboard?tab=doctors', icon: Stethoscope, description: 'Doctor management' },
    { name: 'Appointments', href: '/dashboard?tab=appointments', icon: Calendar, description: 'Schedule appointments' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-2xl">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto scrollbar-thin">
            <div className="flex-shrink-0 flex items-center px-6">
              <div className="w-10 h-10 bg-gradient-primary rounded-2xl flex items-center justify-center mr-3">
                <Stethoscope className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Clinic Manager</h1>
            </div>
            <nav className="mt-8 px-3 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-3 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-gradient-primary hover:text-white transition-all duration-200 hover:shadow-glow"
                  >
                    <Icon className="mr-4 h-5 w-5" />
                    <div>
                      <div>{item.name}</div>
                      <div className="text-xs opacity-75">{item.description}</div>
                    </div>
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-80 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200 shadow-soft">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto scrollbar-thin">
            <div className="flex items-center flex-shrink-0 px-6 mb-8">
              <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center mr-4 shadow-glow">
                <Stethoscope className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Clinic Manager</h1>
                <p className="text-sm text-gray-500">Healthcare Management</p>
              </div>
            </div>
            <nav className="flex-1 px-3 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className="group flex items-center px-4 py-4 text-sm font-medium rounded-xl text-gray-700 hover:bg-gradient-primary hover:text-white transition-all duration-200 hover:shadow-glow"
                  >
                    <Icon className="mr-4 h-5 w-5" />
                    <div>
                      <div className="font-semibold">{item.name}</div>
                      <div className="text-xs opacity-75">{item.description}</div>
                    </div>
                  </a>
                );
              })}
            </nav>
            
            {/* User Profile Section */}
            <div className="px-3 mt-8">
              <div className="bg-gradient-to-r from-gray-50 to-primary-50 rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center mr-3">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-danger-600 transition-colors rounded-lg hover:bg-danger-50"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80 flex flex-col flex-1">
        {/* Top header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow-soft border-b border-gray-200">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="ml-4 flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-danger-500"></span>
              </button>
              
              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100">
                <Settings className="h-5 w-5" />
              </button>
              
              {/* User Menu - Desktop */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
                <div className="w-8 h-8 bg-gradient-primary rounded-xl flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 