'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { User, Clock, MapPin, Stethoscope, Plus, Calendar, Grid, Edit, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import DoctorForm from './DoctorForm';
import CalendarView from './CalendarView';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
  gender: 'male' | 'female' | 'other';
  location: string;
  status: 'available' | 'busy' | 'off_duty';
  bio?: string;
  availability: any;
}

export default function AvailableDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'calendar'>('grid');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

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

  const handleAddDoctor = async (formData: any) => {
    try {
      await api.post('/doctors', formData);
      toast.success('Doctor added successfully');
      setShowAddForm(false);
      loadDoctors();
    } catch (error) {
      toast.error('Failed to add doctor');
    }
  };

  const handleEditDoctor = async (id: string, formData: any) => {
    try {
      await api.put(`/doctors/${id}`, formData);
      toast.success('Doctor updated successfully');
      setEditingDoctor(null);
      loadDoctors();
    } catch (error) {
      toast.error('Failed to update doctor');
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    
    try {
      await api.delete(`/doctors/${id}`);
      toast.success('Doctor deleted successfully');
      loadDoctors();
    } catch (error) {
      toast.error('Failed to delete doctor');
    }
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
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Doctor Management</h2>
          <p className="text-sm text-gray-600">Manage doctors and view their schedules</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="h-4 w-4" />
            </button>
          </div>

          {/* Add Doctor Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Doctor
          </button>
        </div>
      </div>

      {/* Add/Edit Doctor Modal */}
      {(showAddForm || editingDoctor) && (
        <DoctorForm
          doctor={editingDoctor}
          onSubmit={editingDoctor ? handleEditDoctor : handleAddDoctor}
          onCancel={() => {
            setShowAddForm(false);
            setEditingDoctor(null);
          }}
        />
      )}

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor.id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h3>
                      <p className="text-sm text-primary-600 font-medium">{doctor.specialization}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingDoctor(doctor)}
                      className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteDoctor(doctor.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(doctor.status)}`}>
                      {doctor.status.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{getNextAvailableTime(doctor)}</span>
                    </div>
                  </div>

                  {doctor.bio && (
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">{doctor.bio}</p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="w-full btn-secondary text-sm">
                    View Schedule
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <CalendarView doctors={doctors} />
      )}

      {doctors.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <Stethoscope className="mx-auto h-16 w-16 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No doctors available</h3>
          <p className="mt-2 text-sm text-gray-500">Get started by adding your first doctor to the system.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Doctor
          </button>
        </div>
      )}
    </div>
  );
} 