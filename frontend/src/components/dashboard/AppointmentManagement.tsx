'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, User, Plus } from 'lucide-react';
import api from '@/lib/api';

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  type: string;
}

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
}

export default function AppointmentManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadAppointments();
    loadDoctors();
  }, []);

  const loadAppointments = async () => {
    try {
      const response = await api.get('/appointments');
      setAppointments(response.data.appointments || response.data);
    } catch (error) {
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await api.get('/doctors');
      setDoctors(response.data.doctors || response.data);
    } catch (error) {
      toast.error('Failed to load doctors');
    }
  };

  const bookAppointment = async (appointmentData: any) => {
    try {
      await api.post('/appointments', appointmentData);
      toast.success('Appointment booked successfully');
      setShowBookingForm(false);
      loadAppointments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return timeString;
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Appointment Management</h2>
          <p className="text-sm text-gray-600">Schedule and manage patient appointments</p>
        </div>
        <button
          onClick={() => setShowBookingForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule New Appointment
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Calendar</h3>
            <div className="text-center">
              <Calendar className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">Calendar view coming soon</p>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Upcoming Appointments</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {appointments.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No appointments scheduled
                </div>
              ) : (
                appointments.map((appointment) => (
                  <div key={appointment.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {appointment.patientName}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">with</span>
                        <span className="text-sm font-medium text-gray-900">
                          {appointment.doctorName}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500">
                          {formatDate(appointment.appointmentDate)}
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Type: {appointment.type}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {showBookingForm && (
        <BookingForm
          doctors={doctors}
          onClose={() => setShowBookingForm(false)}
          onSubmit={bookAppointment}
        />
      )}
    </div>
  );
}

interface BookingFormProps {
  doctors: Doctor[];
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function BookingForm({ doctors, onClose, onSubmit }: BookingFormProps) {
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    doctorId: '',
    appointmentDate: '',
    startTime: '',
    endTime: '',
    type: 'consultation',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Schedule New Appointment</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Patient Name</label>
            <input
              type="text"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.patientPhone}
              onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.patientEmail}
              onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Doctor</label>
            <select
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="input-field"
            >
              <option value="consultation">Consultation</option>
              <option value="follow_up">Follow-up</option>
              <option value="emergency">Emergency</option>
              <option value="routine_checkup">Routine Checkup</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Schedule Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 