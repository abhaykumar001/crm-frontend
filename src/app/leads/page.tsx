'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { leadsApi } from '@/lib/api';
import { Lead, LeadFilters } from '@/types';
import { formatDate, getStatusColor } from '@/lib/utils';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
} from '@heroicons/react/24/outline';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LeadFilters>({
    page: 1,
    limit: 10,
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLeads();
  }, [filters]);

  const loadLeads = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      try {
        const response = await leadsApi.getLeads(filters);
        if (response.success) {
          setLeads(response.data || []);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError);
      }
      
      // Fallback to mock data if API fails
      const mockLeads = [
        {
          id: 1,
          name: 'John Smith',
          email: 'john.smith@email.com',
          phone: '+91 9876543210',
          requirements: 'Looking for 3BHK apartment in prime location',
          source: { id: 1, name: 'Website', description: 'Website inquiries', isActive: true },
          statusId: 1,
          status: { id: 1, name: 'New', color: '#3B82F6', isActive: true, order: 1 },
          assignedToId: 1,
          assignedTo: { id: 1, name: 'Sarah Wilson', email: 'sarah@company.com', role: 'agent' as const, isActive: true, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
          budget: 5000000,
          isActive: true,
          createdAt: '2023-10-30T10:00:00Z',
          updatedAt: '2023-10-30T10:00:00Z',
        },
        {
          id: 2,
          name: 'Emily Johnson',
          email: 'emily.johnson@email.com',
          phone: '+91 9876543211',
          requirements: 'Commercial space for office setup',
          source: { id: 2, name: 'Referral', description: 'Customer referrals', isActive: true },
          statusId: 2,
          status: { id: 2, name: 'Contacted', color: '#10B981', isActive: true, order: 2 },
          assignedToId: 2,
          assignedTo: { id: 2, name: 'John Doe', email: 'john@company.com', role: 'agent' as const, isActive: true, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
          budget: 8000000,
          isActive: true,
          createdAt: '2023-10-29T14:30:00Z',
          updatedAt: '2023-10-29T14:30:00Z',
        },
        {
          id: 3,
          name: 'Michael Brown',
          email: 'michael.brown@email.com',
          phone: '+91 9876543212',
          requirements: 'Villa with garden and parking',
          source: { id: 3, name: 'Social Media', description: 'Social media campaigns', isActive: true },
          statusId: 3,
          status: { id: 3, name: 'Qualified', color: '#F59E0B', isActive: true, order: 3 },
          assignedToId: 1,
          assignedTo: { id: 1, name: 'Sarah Wilson', email: 'sarah@company.com', role: 'agent' as const, isActive: true, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
          budget: 12000000,
          isActive: true,
          createdAt: '2023-10-28T09:15:00Z',
          updatedAt: '2023-10-28T09:15:00Z',
        },
        {
          id: 4,
          name: 'Lisa Davis',
          email: 'lisa.davis@email.com',
          phone: '+91 9876543213',
          requirements: '2BHK apartment for investment',
          source: { id: 4, name: 'Walk-in', description: 'Walk-in customers', isActive: true },
          statusId: 4,
          status: { id: 4, name: 'Interested', color: '#8B5CF6', isActive: true, order: 4 },
          assignedToId: undefined,
          assignedTo: undefined,
          budget: 3500000,
          isActive: true,
          createdAt: '2023-10-27T16:45:00Z',
          updatedAt: '2023-10-27T16:45:00Z',
        },
        {
          id: 5,
          name: 'David Wilson',
          email: 'david.wilson@email.com',
          phone: '+91 9876543214',
          requirements: 'Luxury penthouse with city view',
          source: { id: 5, name: 'Advertisement', description: 'Paid advertisements', isActive: true },
          statusId: 5,
          status: { id: 5, name: 'Converted', color: '#059669', isActive: true, order: 5 },
          assignedToId: 3,
          assignedTo: { id: 3, name: 'Emily Chen', email: 'emily@company.com', role: 'agent' as const, isActive: true, createdAt: '2023-01-01T00:00:00Z', updatedAt: '2023-01-01T00:00:00Z' },
          budget: 25000000,
          isActive: true,
          createdAt: '2023-10-26T11:20:00Z',
          updatedAt: '2023-10-26T11:20:00Z',
        },
      ];
      
      setLeads(mockLeads);
    } catch (err: any) {
      setError(err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const response = await leadsApi.deleteLead(id);
      if (response.success) {
        setLeads(leads.filter(lead => lead.id !== id));
      } else {
        alert(response.message || 'Failed to delete lead');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete lead');
    }
  };

  if (loading && leads.length === 0) {
    return (
      <DashboardLayout title="Leads">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Leads"
      actions={
        <Link
          href="/leads/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Lead
        </Link>
      }
    >
      {/* Filters */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 mb-6 p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads by name, email, phone, or requirements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filters.statusId || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, statusId: e.target.value ? parseInt(e.target.value) : undefined }))}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="1">New</option>
              <option value="2">Contacted</option>
              <option value="3">Qualified</option>
              <option value="4">Interested</option>
              <option value="5">Converted</option>
              <option value="6">Lost</option>
            </select>
            <select
              value={filters.source || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value || undefined }))}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Sources</option>
              <option value="website">Website</option>
              <option value="referral">Referral</option>
              <option value="social_media">Social Media</option>
              <option value="walk_in">Walk-in</option>
              <option value="advertisement">Advertisement</option>
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
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading leads</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadLeads}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Lead Information
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact Details
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Source & Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Assignment
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm mr-4">
                        {lead.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {lead.name}
                        </div>
                        {lead.requirements && (
                          <div className="text-sm text-gray-500 truncate max-w-xs mt-1">
                            {lead.requirements}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900 flex items-center">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400 mr-2" />
                        {lead.email}
                      </div>
                      <div className="text-sm text-gray-900 flex items-center">
                        <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
                        {lead.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {lead.source?.name || 'Unknown'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status?.name || 'unknown')}`}>
                        {lead.status?.name || 'Unknown'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      {lead.assignedTo ? (
                        <>
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-xs mr-3">
                            {lead.assignedTo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {lead.assignedTo.name}
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500 italic">Unassigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Lead"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/leads/${lead.id}/edit`}
                        className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Edit Lead"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Lead"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {leads.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">
              <h3 className="text-sm font-medium text-gray-900 mb-2">No leads found</h3>
              <p className="text-sm text-gray-500 mb-4">
                Get started by creating your first lead.
              </p>
              <Link
                href="/leads/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Lead
              </Link>
            </div>
          </div>
        )}

        {/* Loading More */}
        {loading && leads.length > 0 && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        )}
      </div>

      {/* Pagination Placeholder */}
      {leads.length > 0 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6 rounded-lg shadow">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{leads.length}</span> of{' '}
                <span className="font-medium">{leads.length}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Previous
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}