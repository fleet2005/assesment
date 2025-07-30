'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { User, Clock, MapPin, Stethoscope, Plus, Calendar, Grid, Edit, Trash2, Phone, Mail, Award, Activity } from 'lucide-react';
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

interface AvailableDoctorsProps {
  onStatsUpdate?: () => void;
}

export default function AvailableDoctors({ onStatsUpdate }: AvailableDoctorsProps) {
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
      setIsLoading(true);
      const response = await api.get('/doctors');
      console.log('Doctors response:', response.data);
      
      // Handle both response formats
      const doctorsData = response.data.doctors || response.data || [];
      setDoctors(Array.isArray(doctorsData) ? doctorsData : []);
    } catch (error: any) {
      console.error('Error loading doctors:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load doctors');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-gradient-success text-white';
      case 'busy':
        return 'bg-gradient-warning text-white';
      case 'off_duty':
        return 'bg-gradient-danger text-white';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <Activity className="h-4 w-4 text-success-500" />;
      case 'busy':
        return <Clock className="h-4 w-4 text-warning-500" />;
      case 'off_duty':
        return <User className="h-4 w-4 text-danger-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
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
      console.log('Adding doctor with data:', formData);
      const response = await api.post('/doctors', formData);
      console.log('Add doctor response:', response.data);
      toast.success('Doctor added successfully');
      setShowAddForm(false);
      loadDoctors();
      onStatsUpdate?.();
    } catch (error: any) {
      console.error('Error adding doctor:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to add doctor');
    }
  };

  const handleEditDoctor = async (id: string, formData: any) => {
    try {
      console.log('Updating doctor with data:', formData);
      const response = await api.patch(`/doctors/${id}`, formData);
      console.log('Update doctor response:', response.data);
      toast.success('Doctor updated successfully');
      setEditingDoctor(null);
      loadDoctors();
      onStatsUpdate?.();
    } catch (error: any) {
      console.error('Error updating doctor:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update doctor');
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    
    try {
      await api.delete(`/doctors/${id}`);
      toast.success('Doctor deleted successfully');
      loadDoctors();
      onStatsUpdate?.();
    } catch (error) {
      toast.error('Failed to delete doctor');
    }
  };

  const stats = {
    total: doctors.length,
    available: doctors.filter(d => d.status === 'available').length,
    busy: doctors.filter(d => d.status === 'busy').length,
    offDuty: doctors.filter(d => d.status === 'off_duty').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner spinner-lg mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Doctor Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage doctors and view their schedules</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-white text-primary-600 shadow-soft'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                viewMode === 'calendar'
                  ? 'bg-white text-primary-600 shadow-soft'
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
            <Plus className="h-5 w-5" />
            Add Doctor
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Doctors</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Stethoscope className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-3xl font-bold text-success-600">{stats.available}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Busy</p>
              <p className="text-3xl font-bold text-warning-600">{stats.busy}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Off Duty</p>
              <p className="text-3xl font-bold text-danger-600">{stats.offDuty}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-danger rounded-xl flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Doctor Modal */}
      {(showAddForm || editingDoctor) && (
        <DoctorForm
          doctor={editingDoctor}
          onSubmit={editingDoctor ? (data) => handleEditDoctor(editingDoctor.id, data) : handleAddDoctor}
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
            <div key={doctor.id} className="card hover-lift group">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h3>
                    <p className="text-primary-600 font-semibold">{doctor.specialization}</p>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => setEditingDoctor(doctor)}
                    className="p-2 text-gray-400 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
                    title="Edit doctor"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteDoctor(doctor.id)}
                    className="p-2 text-gray-400 hover:text-danger-600 transition-colors rounded-lg hover:bg-danger-50"
                    title="Delete doctor"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-600">{doctor.location}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-600">{doctor.phone}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-4 w-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-600">{doctor.email}</span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className={`badge ${getStatusColor(doctor.status)}`}>
                    {doctor.status.replace('_', ' ')}
                  </span>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>{getNextAvailableTime(doctor)}</span>
                  </div>
                </div>

                {doctor.bio && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Award className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Bio</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{doctor.bio}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <button className="w-full btn-secondary text-sm">
                  View Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <CalendarView doctors={doctors} />
      )}

      {doctors.length === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Stethoscope className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No doctors available</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first doctor to the system.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add First Doctor
          </button>
        </div>
      )}
    </div>
  );
} 