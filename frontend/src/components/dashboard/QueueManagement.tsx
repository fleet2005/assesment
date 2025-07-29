'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Clock, User, AlertTriangle, CheckCircle } from 'lucide-react';
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

export default function QueueManagement() {
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
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add patient');
    }
  };

  const updateQueueItemStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/queue/${id}/status`, { status });
      toast.success('Status updated');
      loadQueueItems();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const removeFromQueue = async (id: string) => {
    try {
      await api.delete(`/queue/${id}`);
      toast.success('Patient removed from queue');
      loadQueueItems();
    } catch (error: any) {
      toast.error('Failed to remove patient');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'with_doctor':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'urgent':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredItems = queueItems.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

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
          <h2 className="text-xl font-semibold text-gray-900">Queue Management</h2>
          <p className="text-sm text-gray-600">Manage patient queue and priorities</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Patient
        </button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input-field w-48"
        >
          <option value="all">All Patients</option>
          <option value="waiting">Waiting</option>
          <option value="with_doctor">With Doctor</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Current Queue</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {filteredItems.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No patients in queue
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div key={item.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(item.status)}
                      <span className="text-sm font-medium text-gray-900">
                        {index + 1}. {item.patientName}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      Arrival: {new Date(item.arrivalTime).toLocaleTimeString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Est. Wait: {item.estimatedWaitTime} min
                    </div>
                    <select
                      value={item.status}
                      onChange={(e) => updateQueueItemStatus(item.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="waiting">Waiting</option>
                      <option value="with_doctor">With Doctor</option>
                      <option value="completed">Completed</option>
                    </select>
                    <button
                      onClick={() => removeFromQueue(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                {item.symptoms && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Symptoms:</span> {item.symptoms}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Patient</h3>
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
            <label className="block text-sm font-medium text-gray-700">Symptoms</label>
            <textarea
              value={formData.symptoms}
              onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
              className="input-field"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
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
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field"
              rows={2}
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
              Add Patient
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 