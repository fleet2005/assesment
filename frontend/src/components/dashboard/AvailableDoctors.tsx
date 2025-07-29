'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { User, Clock, MapPin, Stethoscope } from 'lucide-react';
import api from '@/lib/api';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  status: 'available' | 'busy' | 'off_duty';
  location: string;
  bio?: string;
  availability: any;
}

export default function AvailableDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data.doctors || response.data);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'off_duty':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextAvailableTime = (doctor: Doctor) => {
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const currentTime = now.toTimeString().slice(0, 5);

    const todayAvailability = doctor.availability[currentDay];
    
    if (!todayAvailability.available) {
      return 'Not available today';
    }

    if (currentTime < todayAvailability.start) {
      return `Today at ${todayAvailability.start}`;
    }

    if (currentTime >= todayAvailability.start && currentTime < todayAvailability.end) {
      return 'Now';
    }

    return 'Not available today';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Available Doctors</h2>
        <p className="text-sm text-gray-600">View doctor availability and schedules</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {doctor.firstName} {doctor.lastName}
                </h3>
                <p className="text-sm text-gray-600">{doctor.specialization}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{doctor.location}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Stethoscope className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{doctor.specialization}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(doctor.status)}`}>
                  {doctor.status.replace('_', ' ')}
                </span>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{getNextAvailableTime(doctor)}</span>
                </div>
              </div>

              {doctor.bio && (
                <p className="text-sm text-gray-600 mt-3">{doctor.bio}</p>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <button className="w-full btn-secondary text-sm">
                View Schedule
              </button>
            </div>
          </div>
        ))}
      </div>

      {doctors.length === 0 && (
        <div className="text-center py-12">
          <Stethoscope className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors available</h3>
          <p className="mt-1 text-sm text-gray-500">No doctors are currently registered in the system.</p>
        </div>
      )}
    </div>
  );
} 