'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { communicationApi } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import {
  PlusIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  VideoCameraIcon,
  CalendarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  UserIcon,
  PhoneArrowUpRightIcon,
  PhoneArrowDownLeftIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface Communication {
  id: number;
  type: 'call' | 'email' | 'sms' | 'meeting' | 'whatsapp';
  direction: 'inbound' | 'outbound';
  subject?: string;
  content?: string;
  duration?: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  leadId: number;
  leadName: string;
  leadPhone?: string;
  leadEmail?: string;
  agentId: number;
  agentName: string;
  scheduledAt?: string;
  completedAt?: string;
  createdAt: string;
  notes?: string;
  followUpRequired: boolean;
  followUpDate?: string;
}

interface CommunicationFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
  direction?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default function CommunicationPage() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<CommunicationFilters>({
    page: 1,
    limit: 20,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const communicationTypes = [
    { id: 'all', name: 'All', icon: ChatBubbleLeftRightIcon, color: 'gray' },
    { id: 'call', name: 'Calls', icon: PhoneIcon, color: 'blue' },
    { id: 'email', name: 'Emails', icon: EnvelopeIcon, color: 'green' },
    { id: 'sms', name: 'SMS', icon: ChatBubbleLeftRightIcon, color: 'purple' },
    { id: 'meeting', name: 'Meetings', icon: VideoCameraIcon, color: 'orange' },
    { id: 'whatsapp', name: 'WhatsApp', icon: ChatBubbleLeftRightIcon, color: 'green' },
  ];

  useEffect(() => {
    loadCommunications();
  }, [filters]);

  // Mock data for demonstration
  useEffect(() => {
    const mockData: Communication[] = [
      {
        id: 1,
        type: 'call',
        direction: 'outbound',
        subject: 'Follow-up call regarding property inquiry',
        duration: 1200,
        status: 'completed',
        leadId: 1,
        leadName: 'John Smith',
        leadPhone: '+91 9876543210',
        agentId: 1,
        agentName: 'Sarah Wilson',
        completedAt: '2023-10-30T14:30:00Z',
        createdAt: '2023-10-30T14:00:00Z',
        notes: 'Client interested in 3BHK apartments. Scheduled property visit for next weekend.',
        followUpRequired: true,
        followUpDate: '2023-11-05T10:00:00Z',
      },
      {
        id: 2,
        type: 'email',
        direction: 'outbound',
        subject: 'Property brochure and pricing details',
        status: 'completed',
        leadId: 2,
        leadName: 'Emily Johnson',
        leadEmail: 'emily.johnson@email.com',
        agentId: 1,
        agentName: 'Sarah Wilson',
        completedAt: '2023-10-30T11:15:00Z',
        createdAt: '2023-10-30T11:00:00Z',
        content: 'Sent detailed brochure for Phoenix Heights project with pricing and floor plans.',
        followUpRequired: false,
      },
      {
        id: 3,
        type: 'meeting',
        direction: 'outbound',
        subject: 'Property site visit',
        status: 'scheduled',
        leadId: 3,
        leadName: 'Michael Brown',
        leadPhone: '+91 9876543211',
        agentId: 2,
        agentName: 'John Doe',
        scheduledAt: '2023-11-02T15:00:00Z',
        createdAt: '2023-10-30T09:30:00Z',
        notes: 'Site visit scheduled for Skyline Towers. Client particularly interested in amenities.',
        followUpRequired: false,
      },
      {
        id: 4,
        type: 'call',
        direction: 'inbound',
        subject: 'Inquiry about loan assistance',
        duration: 0,
        status: 'missed',
        leadId: 4,
        leadName: 'Lisa Davis',
        leadPhone: '+91 9876543212',
        agentId: 1,
        agentName: 'Sarah Wilson',
        scheduledAt: '2023-10-30T16:00:00Z',
        createdAt: '2023-10-30T16:00:00Z',
        followUpRequired: true,
        followUpDate: '2023-10-31T10:00:00Z',
      },
      {
        id: 5,
        type: 'whatsapp',
        direction: 'outbound',
        subject: 'Payment schedule reminder',
        status: 'completed',
        leadId: 5,
        leadName: 'David Wilson',
        leadPhone: '+91 9876543213',
        agentId: 3,
        agentName: 'Emily Chen',
        completedAt: '2023-10-30T10:45:00Z',
        createdAt: '2023-10-30T10:40:00Z',
        content: 'Reminder sent for upcoming payment due date with payment options.',
        followUpRequired: false,
      },
    ];

    setCommunications(mockData);
    setLoading(false);
  }, []);

  const loadCommunications = async () => {
    try {
      setLoading(true);
      // const response = await communicationApi.getCommunications(filters);
      // if (response.success) {
      //   setCommunications(response.data || []);
      // } else {
      //   setError(response.message || 'Failed to load communications');
      // }
    } catch (err: any) {
      setError(err.message || 'Failed to load communications');
    } finally {
      // setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this communication record?')) return;

    try {
      // const response = await communicationApi.deleteCommunication(id);
      // if (response.success) {
      setCommunications(communications.filter(comm => comm.id !== id));
      // } else {
      //   alert(response.message || 'Failed to delete communication');
      // }
    } catch (err: any) {
      alert(err.message || 'Failed to delete communication');
    }
  };

  const getTypeIcon = (type: string) => {
    const typeConfig = communicationTypes.find(t => t.id === type);
    return typeConfig?.icon || ChatBubbleLeftRightIcon;
  };

  const getTypeColor = (type: string) => {
    const colorClasses = {
      call: 'bg-blue-100 text-blue-800',
      email: 'bg-green-100 text-green-800',
      sms: 'bg-purple-100 text-purple-800',
      meeting: 'bg-orange-100 text-orange-800',
      whatsapp: 'bg-green-100 text-green-800',
    };
    return colorClasses[type as keyof typeof colorClasses] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colorClasses = {
      completed: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      missed: 'bg-yellow-100 text-yellow-800',
    };
    return colorClasses[status as keyof typeof colorClasses] || 'bg-gray-100 text-gray-800';
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const filteredCommunications = selectedType === 'all' 
    ? communications 
    : communications.filter(comm => comm.type === selectedType);

  if (loading && communications.length === 0) {
    return (
      <DashboardLayout title="Communication">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Communication"
      actions={
        <div className="flex items-center space-x-3">
          <Link
            href="/communication/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm text-sm font-medium transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Log Communication
          </Link>
        </div>
      }
    >
      {/* Communication Type Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex space-x-1">
          {communicationTypes.map((type) => {
            const Icon = type.icon;
            const isActive = selectedType === type.id;
            const count = type.id === 'all' 
              ? communications.length 
              : communications.filter(c => c.type === type.id).length;

            return (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {type.name}
                <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 mb-6 p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search communications by lead name, subject, or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="completed">Completed</option>
              <option value="scheduled">Scheduled</option>
              <option value="cancelled">Cancelled</option>
              <option value="missed">Missed</option>
            </select>
            <select
              value={filters.direction || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, direction: e.target.value || undefined }))}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Directions</option>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading communications</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadCommunications}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Communications List */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-200">
          {filteredCommunications.map((comm) => {
            const Icon = getTypeIcon(comm.type);
            const isFollowUpRequired = comm.followUpRequired && comm.status === 'completed';
            
            return (
              <div key={comm.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {/* Type Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      comm.type === 'call' ? 'bg-blue-100' :
                      comm.type === 'email' ? 'bg-green-100' :
                      comm.type === 'sms' ? 'bg-purple-100' :
                      comm.type === 'meeting' ? 'bg-orange-100' :
                      comm.type === 'whatsapp' ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        comm.type === 'call' ? 'text-blue-600' :
                        comm.type === 'email' ? 'text-green-600' :
                        comm.type === 'sms' ? 'text-purple-600' :
                        comm.type === 'meeting' ? 'text-orange-600' :
                        comm.type === 'whatsapp' ? 'text-green-600' : 'text-gray-600'
                      }`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {comm.subject || `${comm.type.charAt(0).toUpperCase() + comm.type.slice(1)} with ${comm.leadName}`}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeColor(comm.type)}`}>
                          {comm.type}
                        </span>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(comm.status)}`}>
                          {comm.status}
                        </span>
                        {comm.direction === 'inbound' ? (
                          <PhoneArrowDownLeftIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <PhoneArrowUpRightIcon className="h-4 w-4 text-blue-500" />
                        )}
                        {isFollowUpRequired && (
                          <div className="flex items-center text-orange-600">
                            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">Follow-up required</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          {comm.leadName}
                        </div>
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          Agent: {comm.agentName}
                        </div>
                        {comm.duration && comm.duration > 0 && (
                          <div className="flex items-center">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            {formatDuration(comm.duration)}
                          </div>
                        )}
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {comm.completedAt ? 
                            formatDate(comm.completedAt) :
                            comm.scheduledAt ?
                            'Scheduled for ' + formatDate(comm.scheduledAt) :
                            formatDate(comm.createdAt)
                          }
                        </div>
                      </div>

                      {(comm.content || comm.notes) && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {comm.content || comm.notes}
                        </p>
                      )}

                      {comm.followUpRequired && comm.followUpDate && (
                        <div className="flex items-center text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-md">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          Follow-up scheduled for {formatDate(comm.followUpDate)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/communication/${comm.id}`}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/communication/${comm.id}/edit`}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(comm.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {filteredCommunications.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            <ChatBubbleLeftRightIcon className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No communications found</h3>
          <p className="text-gray-500 mb-6">
            Start tracking your customer interactions by logging your first communication.
          </p>
          <Link
            href="/communication/new"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Log First Communication
          </Link>
        </div>
      )}

      {/* Loading More */}
      {loading && communications.length > 0 && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}
    </DashboardLayout>
  );
}