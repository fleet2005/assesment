'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Clock, User, AlertTriangle, CheckCircle, X, Phone, MapPin, Activity, Users as UsersIcon, Users, Trash2, FileText } from 'lucide-react';
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    loadQueueItems();
  }, []);

  const loadQueueItems = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/queue');
      console.log('Queue items loaded:', response.data);
      setQueueItems(response.data || []);
    } catch (error) {
      console.error('Error loading queue items:', error);
      console.error('Error response:', error.response?.data);
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
    } finally {
      setIsLoading(false);
    }
  };

  const updateQueueItemStatus = async (id: string, status: string) => {
    try {
      const response = await api.patch(`/queue/${id}/status`, { status });
      console.log('Status update response:', response.data);
      toast.success('Status updated successfully');
      
      // Update the local state immediately for better UX
      setQueueItems(prevItems => 
        prevItems.map(item => 
          item.id === id ? { ...item, status: status as any } : item
        )
      );
      
      // Refresh from server after a short delay to ensure consistency
      setTimeout(() => {
        loadQueueItems();
      }, 1000);
      
      // Update dashboard stats
      onStatsUpdate?.();
    } catch (error: any) {
      console.error('Error updating status:', error);
      console.error('Error response:', error.response?.data);
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return <AlertTriangle className="h-4 w-4" />;
      case 'urgent':
        return <Clock className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  // Calculate actual wait time in minutes
  const calculateWaitTime = (arrivalTime: string) => {
    const arrival = new Date(arrivalTime);
    const now = new Date();
    const diffMs = now.getTime() - arrival.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes;
  };

  // Sort items by priority and arrival time
  const sortQueueItems = (items: QueueItem[]) => {
    return items.sort((a, b) => {
      // Priority order: emergency > urgent > normal
      const priorityOrder = { emergency: 3, urgent: 2, normal: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      // If same priority, sort by arrival time (earlier first)
      const aArrival = new Date(a.arrivalTime);
      const bArrival = new Date(b.arrivalTime);
      return aArrival.getTime() - bArrival.getTime();
    });
  };

  // Filter items based on both status and priority
  const filteredItems = sortQueueItems(queueItems.filter(item => {
    const statusMatch = statusFilter === 'all' || item.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || item.priority === priorityFilter;
    return statusMatch && priorityMatch;
  }));

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
          <p className="text-gray-600 dark:text-gray-400">Loading queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Queue Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage patient flow and priorities</p>
        </div>
        
        <div className="hidden md:flex items-center gap-6 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-soft border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.total}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning-600 dark:text-warning-400">{stats.waiting}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Waiting</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{stats.withDoctor}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">With Doctor</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success-600 dark:text-success-400">{stats.completed}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Completed</div>
          </div>
        </div>
        
        <button onClick={() => setShowAddForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" /> Add Patient
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>
        
        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Waiting</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.waiting}</p>
            </div>
            <div className="w-12 h-12 bg-warning-100 dark:bg-warning-900 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-warning-600 dark:text-warning-400" />
            </div>
          </div>
        </div>
        
        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">With Doctor</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.withDoctor}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-xl flex items-center justify-center">
              <User className="h-6 w-6 text-primary-600 dark:text-primary-400" />
            </div>
          </div>
        </div>
        
        <div className="card hover-lift">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-success-600 dark:text-success-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)} 
            className="input-field max-w-xs"
          >
            <option value="all">All Status</option>
            <option value="waiting">Waiting</option>
            <option value="with_doctor">With Doctor</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority:</label>
          <select 
            value={priorityFilter} 
            onChange={(e) => setPriorityFilter(e.target.value)} 
            className="input-field max-w-xs"
          >
            <option value="all">All Priority</option>
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
            <option value="emergency">Emergency</option>
          </select>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span>Showing {filteredItems.length} of {queueItems.length} patients</span>
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-soft border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-700 dark:to-gray-800/50">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Current Queue</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage patient flow and priorities</p>
        </div>
        
        {filteredItems.length === 0 ? (
          <div className="px-8 py-16 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <UsersIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No patients in queue</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Add your first patient to get started</p>
            <button onClick={() => setShowAddForm(true)} className="btn-primary">
              <Plus className="h-5 w-5 mr-2" /> Add First Patient
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {filteredItems.map((item, index) => {
              const waitTime = calculateWaitTime(item.arrivalTime);
              const isEmergency = item.priority === 'emergency';
              const isUrgent = item.priority === 'urgent';
              
              return (
                <div 
                  key={item.id} 
                  className={`px-8 py-6 hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-all duration-200 ${
                    isEmergency ? 'border-l-4 border-l-danger-500 bg-danger-50/30 dark:bg-danger-900/10' :
                    isUrgent ? 'border-l-4 border-l-warning-500 bg-warning-50/30 dark:bg-warning-900/10' :
                    'border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isEmergency ? 'bg-gradient-danger' :
                          isUrgent ? 'bg-gradient-warning' :
                          'bg-gradient-primary'
                        }`}>
                          <span className="text-white font-semibold text-sm">
                            {item.patientName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{item.patientName}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.patientPhone}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Priority Badge */}
                      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(item.priority)}`}>
                        {getPriorityIcon(item.priority)}
                        <span className="capitalize">{item.priority}</span>
                      </div>
                      
                      {/* Status Badge */}
                      <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(item.status)}`}>
                        {getStatusIcon(item.status)}
                        <span className="capitalize">{item.status.replace('_', ' ')}</span>
                      </div>
                      
                      {/* Status Update Dropdown */}
                      <select
                        value={item.status}
                        onChange={(e) => updateQueueItemStatus(item.id, e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="waiting">Waiting</option>
                        <option value="with_doctor">With Doctor</option>
                        <option value="completed">Completed</option>
                      </select>
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromQueue(item.id)}
                        className="p-2 text-gray-400 hover:text-danger-600 dark:hover:text-danger-400 transition-colors rounded-lg hover:bg-danger-50 dark:hover:bg-danger-900/20"
                        title="Remove from queue"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Additional Info */}
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                      <span>Arrival: {new Date(item.arrivalTime).toLocaleTimeString()}</span>
                      <span className={`font-semibold ${
                        waitTime > 60 ? 'text-danger-600 dark:text-danger-400' :
                        waitTime > 30 ? 'text-warning-600 dark:text-warning-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                        Wait: {waitTime} min
                      </span>
                    </div>
                    <span className="text-xs">#{index + 1}</span>
                  </div>
                  
                  {/* Symptoms Section */}
                  {item.symptoms && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600">
                      <div className="flex items-center space-x-2 mb-2">
                        <Activity className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Symptoms</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.symptoms}</p>
                    </div>
                  )}
                  
                  {/* Notes Section */}
                  {item.notes && (
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Notes</span>
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{item.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddForm && (
        <AddPatientForm onClose={() => setShowAddForm(false)} onSubmit={addPatientToQueue} />
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
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full animate-scaleIn">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Add New Patient</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Add patient to the queue</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Patient Name *</label>
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
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone Number *</label>
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
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Symptoms</label>
            <textarea
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className="input-field"
              rows={3}
              placeholder="Describe patient symptoms..."
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Priority</label>
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
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows={2}
              placeholder="Additional notes..."
            />
          </div>
          
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-100 dark:border-gray-700">
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