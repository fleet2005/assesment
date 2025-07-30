'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Clock, User, AlertTriangle, CheckCircle, X, Phone, MapPin, Activity, Users as UsersIcon } from 'lucide-react';
import api from '@/lib/api';

interface QueueItem {
  id: string;
  patientName: string;
  patientPhone: string;
  status: 'waiting' | 'with_doctor' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent' | 'emergency';
  arrivalTime: string;
  estimatedWaitTime: number;
  symptoms?: string;
  notes?: string;
}

interface QueueManagementProps {
  onStatsUpdate?: () => void;
}

export default function QueueManagement({ onStatsUpdate }: QueueManagementProps) {
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadQueueItems();
  }, []);

  const loadQueueItems = async () => {
    try {
      const response = await api.get('/queue');
      setQueueItems(response.data);
    } catch (error) {
      toast.error('Failed to load queue items');
    } finally {
      setIsLoading(false);
    }
  };

  const addPatientToQueue = async (patientData: any) => {
    try {
      await api.post('/queue', patientData);
      toast.success('Patient added to queue');
      setShowAddForm(false);
      loadQueueItems();
      onStatsUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add patient');
    }
  };

  const updateQueueItemStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/queue/${id}/status`, { status });
      toast.success('Status updated');
      loadQueueItems();
      onStatsUpdate?.();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const removeFromQueue = async (id: string) => {
    try {
      await api.delete(`/queue/${id}`);
      toast.success('Patient removed from queue');
      loadQueueItems();
      onStatsUpdate?.();
    } catch (error: any) {
      toast.error('Failed to remove patient');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="h-5 w-5 text-warning-500" />;
      case 'with_doctor':
        return <User className="h-5 w-5 text-primary-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-gradient-danger text-white';
      case 'urgent':
        return 'bg-gradient-warning text-white';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-warning-100 text-warning-800 border-warning-200';
      case 'with_doctor':
        return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'completed':
        return 'bg-success-100 text-success-800 border-success-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredItems = queueItems.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  const stats = {
    waiting: queueItems.filter(item => item.status === 'waiting').length,
    withDoctor: queueItems.filter(item => item.status === 'with_doctor').length,
    completed: queueItems.filter(item => item.status === 'completed').length,
    total: queueItems.length
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="spinner spinner-lg mx-auto mb-4"></div>
          <p className="text-gray-600">Loading queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Patient Queue</h2>
          <p className="text-gray-600">Manage patient queue and priorities efficiently</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Queue Stats */}
          <div className="hidden md:flex items-center gap-6 bg-white rounded-2xl p-4 shadow-soft border border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-warning-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {stats.waiting} Waiting
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {stats.withDoctor} With Doctor
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                {stats.completed} Completed
              </span>
            </div>
          </div>

          {/* Add Patient Button */}
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Add Patient
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <UsersIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Waiting</p>
              <p className="text-3xl font-bold text-warning-600">{stats.waiting}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">With Doctor</p>
              <p className="text-3xl font-bold text-primary-600">{stats.withDoctor}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-success-600">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field max-w-xs"
        >
          <option value="all">All Patients</option>
          <option value="waiting">Waiting</option>
          <option value="with_doctor">With Doctor</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100/50">
          <h3 className="text-xl font-bold text-gray-900">Current Queue</h3>
          <p className="text-sm text-gray-600 mt-1">Manage patient flow and priorities</p>
        </div>
        
        {filteredItems.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <UsersIcon className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No patients in queue</h3>
            <p className="text-gray-600 mb-6">Add your first patient to get started</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add First Patient
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredItems.map((item, index) => (
              <div key={item.id} className="px-8 py-6 hover:bg-gray-50/50 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
                        <span className="text-lg font-bold text-white">{index + 1}</span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          {getStatusIcon(item.status)}
                          <span className="text-lg font-semibold text-gray-900">
                            {item.patientName}
                          </span>
                          <span className={`badge ${getPriorityColor(item.priority)}`}>
                            {item.priority}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Phone className="h-4 w-4" />
                            <span>{item.patientPhone}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>Arrived: {new Date(item.arrivalTime).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        Est. Wait: {item.estimatedWaitTime} min
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(item.arrivalTime).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <select
                      value={item.status}
                      onChange={(e) => updateQueueItemStatus(item.id, e.target.value)}
                      className="px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                    >
                      <option value="waiting">Waiting</option>
                      <option value="with_doctor">With Doctor</option>
                      <option value="completed">Completed</option>
                    </select>
                    
                    <button
                      onClick={() => removeFromQueue(item.id)}
                      className="p-2 text-gray-400 hover:text-danger-600 transition-colors rounded-lg hover:bg-danger-50"
                      title="Remove from queue"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {item.symptoms && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center space-x-2 mb-2">
                      <Activity className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Symptoms</span>
                    </div>
                    <p className="text-sm text-gray-600">{item.symptoms}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showAddForm && (
        <AddPatientForm
          onClose={() => setShowAddForm(false)}
          onSubmit={addPatientToQueue}
        />
      )}
    </div>
  );
}

interface AddPatientFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

function AddPatientForm({ onClose, onSubmit }: AddPatientFormProps) {
  const [formData, setFormData] = useState({
    patientName: '',
    patientPhone: '',
    symptoms: '',
    priority: 'normal',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full animate-scaleIn">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Add New Patient</h3>
                <p className="text-sm text-gray-600">Add patient to the queue</p>
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
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Symptoms</label>
            <textarea
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Describe patient symptoms..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              className="input-field"
            >
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows={2}
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
              Add Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 