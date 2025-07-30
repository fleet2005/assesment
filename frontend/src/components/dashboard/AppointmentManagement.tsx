'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, User, Plus, X, Phone, Mail, MapPin, Activity, Users as UsersIcon, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import api from '@/lib/api';

interface Appointment {
  id: string;
  patientName: string;
  doctorName?: string; // Optional, will be populated by backend
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

interface AppointmentManagementProps {
  onStatsUpdate?: () => void;
}

export default function AppointmentManagement({ onStatsUpdate }: AppointmentManagementProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [preFilledData, setPreFilledData] = useState<{
    doctorId: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
  } | null>(null);

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
      // Refresh available slots if we have a selected doctor and date
      if (selectedDoctor) {
        loadAvailableSlots();
      }
      onStatsUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    }
  };

  const deleteAppointment = async (appointmentId: string) => {
    try {
      await api.delete(`/appointments/${appointmentId}`);
      toast.success('Appointment deleted successfully');
      loadAppointments();
      // Refresh available slots if we have a selected doctor and date
      if (selectedDoctor) {
        loadAvailableSlots();
      }
      onStatsUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete appointment');
    }
  };

  const updateAppointmentStatus = async (appointmentId: string, status: string) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status });
      toast.success(`Appointment marked as ${status.replace('_', ' ')}`);
      loadAppointments();
      onStatsUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update appointment status');
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDoctor) return;
    
    setIsLoadingSlots(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await api.get(`/appointments/slots/${selectedDoctor}/${dateStr}`);
      setAvailableSlots(response.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load available slots');
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleSlotSelect = (slot: string) => {
    // Pre-fill the booking form with selected slot
    setShowBookingForm(true);
    
    // Calculate end time (30 minutes after start time)
    const startTime = new Date(`2000-01-01T${slot}`);
    const endTime = new Date(startTime.getTime() + 30 * 60 * 1000); // Add 30 minutes
    const endTimeStr = endTime.toTimeString().slice(0, 5);
    
    // Auto-fill the booking form with selected details
    const selectedDoctorData = doctors.find(d => d.id === selectedDoctor);
    const dateStr = selectedDate.toISOString().split('T')[0];
    
    // Store the pre-filled data to pass to the booking form
    setPreFilledData({
      doctorId: selectedDoctor,
      appointmentDate: dateStr,
      startTime: slot,
      endTime: endTimeStr
    });
    
    toast.success(`Selected slot: ${slot} with Dr. ${selectedDoctorData?.lastName || 'Unknown'}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-gradient-primary text-white';
      case 'confirmed':
        return 'bg-gradient-success text-white';
      case 'in_progress':
        return 'bg-gradient-warning text-white';
      case 'completed':
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800';
      case 'cancelled':
        return 'bg-gradient-danger text-white';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-primary-500" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-success-500" />;
      case 'in_progress':
        return <Activity className="h-4 w-4 text-warning-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-danger-500" />;
      default:
        return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(apt => apt.status === 'scheduled').length,
    confirmed: appointments.filter(apt => apt.status === 'confirmed').length,
    inProgress: appointments.filter(apt => apt.status === 'in_progress').length,
    completed: appointments.filter(apt => apt.status === 'completed').length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner spinner-lg mx-auto mb-4"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Appointment Management</h2>
          <p className="text-gray-600">Schedule and manage patient appointments efficiently</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Appointment Stats */}
          <div className="hidden md:flex items-center gap-6 bg-white rounded-2xl p-4 shadow-soft border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {stats.scheduled} Scheduled
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {stats.confirmed} Confirmed
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {stats.inProgress} In Progress
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {stats.completed} Completed
              </span>
            </div>
          </div>

          {/* Schedule Button */}
          <button
            onClick={() => setShowBookingForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Schedule Appointment
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-3xl font-bold text-primary-600">{stats.scheduled}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-3xl font-bold text-success-600">{stats.confirmed}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-warning-600">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center">
              <Activity className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-gray-600">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar Preview */}
        <div className="lg:col-span-1">
          <div className="card hover-lift">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Availability Calendar</h3>
                <p className="text-sm text-gray-600">Check doctor availability</p>
              </div>
            </div>
            
            {/* Doctor and Date Selection */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                <input
                  type="date"
                  value={isNaN(selectedDate.getTime()) ? '' : selectedDate.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const dateValue = e.target.value;
                    if (dateValue) {
                      setSelectedDate(new Date(dateValue));
                    } else {
                      setSelectedDate(new Date());
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              {selectedDoctor && (
                <button
                  onClick={loadAvailableSlots}
                  className="w-full btn-primary"
                  disabled={isLoadingSlots}
                >
                  {isLoadingSlots ? 'Loading...' : 'Check Availability'}
                </button>
              )}
            </div>
            
            {/* Available Slots */}
            {availableSlots.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Available Slots</h4>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {availableSlots.map((slot, index) => (
                    <button
                      key={index}
                      onClick={() => handleSlotSelect(slot)}
                      className="px-3 py-2 text-sm bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {selectedDoctor && availableSlots.length === 0 && !isLoadingSlots && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No available slots for this date</p>
              </div>
            )}
          </div>
        </div>

        {/* Appointments List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50">
              <h3 className="text-xl font-bold text-gray-900">Upcoming Appointments</h3>
              <p className="text-sm text-gray-600 mt-1">Manage and track all appointments</p>
            </div>
            
            {appointments.length === 0 ? (
              <div className="px-8 py-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments scheduled</h3>
                <p className="text-gray-600 mb-6">Schedule your first appointment to get started</p>
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="btn-primary"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Schedule First Appointment
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="px-8 py-6 hover:bg-gray-50/50 transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-3 mb-2">
                              {getStatusIcon(appointment.status)}
                              <span className="text-lg font-semibold text-gray-900">
                                {appointment.patientName}
                              </span>
                              <span className="text-sm text-gray-500">with</span>
                              <span className="font-semibold text-primary-600">
                                Dr. {appointment.doctorName}
                              </span>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(appointment.appointmentDate)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Activity className="h-4 w-4" />
                                <span className="capitalize">{appointment.type.replace('_', ' ')}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <span className={`badge ${getStatusColor(appointment.status)}`}>
                          {appointment.status.replace('_', ' ')}
                        </span>
                        
                        {/* Status Update Buttons */}
                        {appointment.status === 'scheduled' && (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'in_progress')}
                              className="px-3 py-1 text-xs bg-warning-100 text-warning-700 border border-warning-200 rounded-lg hover:bg-warning-200 transition-colors"
                              title="Mark as in progress"
                            >
                              Start
                            </button>
                            <button
                              onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                              className="px-3 py-1 text-xs bg-success-100 text-success-700 border border-success-200 rounded-lg hover:bg-success-200 transition-colors"
                              title="Mark as completed"
                            >
                              Complete
                            </button>
                          </div>
                        )}
                        
                        {appointment.status === 'in_progress' && (
                          <button
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                            className="px-3 py-1 text-xs bg-success-100 text-success-700 border border-success-200 rounded-lg hover:bg-success-200 transition-colors"
                            title="Mark as completed"
                          >
                            Complete
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteAppointment(appointment.id)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete appointment"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showBookingForm && (
        <BookingForm
          doctors={doctors}
          preFilledData={preFilledData}
          onClose={() => {
            setShowBookingForm(false);
            setPreFilledData(null);
          }}
          onSubmit={bookAppointment}
        />
      )}
    </div>
  );
}

interface BookingFormProps {
  doctors: Doctor[];
  preFilledData?: {
    doctorId: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
  } | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function BookingForm({ doctors, preFilledData, onClose, onSubmit }: BookingFormProps) {
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    patientEmail: '',
    doctorId: preFilledData?.doctorId || '',
    appointmentDate: preFilledData?.appointmentDate || '',
    startTime: preFilledData?.startTime || '',
    endTime: preFilledData?.endTime || '',
    type: 'consultation',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Schedule New Appointment</h3>
                <p className="text-sm text-gray-600">Book a new patient appointment</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Note about checking available slots */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-blue-900 mb-1">Important Note</h4>
                <p className="text-sm text-blue-700">
                  Please check the available slots using the availability calendar before selecting a time to ensure the slot is available for booking.
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Patient Name *</label>
              <input
                type="text"
                value={formData.patientName}
                onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                className="input-field"
                placeholder="Enter patient name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
              <input
                type="tel"
                value={formData.patientPhone}
                onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                className="input-field"
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.patientEmail}
              onChange={(e) => setFormData({ ...formData, patientEmail: e.target.value })}
              className="input-field"
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Doctor *</label>
            <select
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              className="input-field"
              required
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
            <input
              type="date"
              value={formData.appointmentDate}
              onChange={(e) => setFormData({ ...formData, appointmentDate: e.target.value })}
              className="input-field"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Start Time *</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">End Time *</label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Appointment Type</label>
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
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100">
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