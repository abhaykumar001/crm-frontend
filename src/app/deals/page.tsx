'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { dealsApi } from '@/lib/api';
import { Deal } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CurrencyRupeeIcon,
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';

interface DealFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  stage?: string;
  agentId?: number;
}

const dealStages = [
  'Lead',
  'Qualified',
  'Proposal',
  'Negotiation',
  'Closed Won',
  'Closed Lost'
];

const stageColors = {
  'Lead': 'bg-gray-100 text-gray-800',
  'Qualified': 'bg-blue-100 text-blue-800',
  'Proposal': 'bg-yellow-100 text-yellow-800',
  'Negotiation': 'bg-orange-100 text-orange-800',
  'Closed Won': 'bg-green-100 text-green-800',
  'Closed Lost': 'bg-red-100 text-red-800',
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DealFilters>({
    page: 1,
    limit: 20,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'pipeline' | 'list'>('pipeline');
  const [dealStats, setDealStats] = useState({
    totalValue: 0,
    wonDeals: 0,
    avgDealSize: 0,
    conversionRate: 0,
  });

  useEffect(() => {
    loadDeals();
    loadDealStats();
  }, [filters]);

  const loadDeals = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      try {
        const response = await dealsApi.getDeals(filters);
        if (response.success) {
          setDeals(response.data || []);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError);
      }
      
      // Fallback to mock data if API fails
      const mockDeals: Deal[] = [
        {
          id: 1,
          leadId: 1,
          lead: { id: 1, firstName: 'John', lastName: 'Smith' } as any,
          projectId: 1,
          project: { id: 1, name: 'Phoenix Heights' } as any,
          agentId: 1,
          agent: { id: 1, firstName: 'Sarah', lastName: 'Wilson' } as any,
          dealValue: 12500000,
          commissionRate: 2.5,
          commissionAmount: 312500,
          status: 'pending',
          notes: '3BHK Purchase',
          closingDate: '2023-11-15',
          isActive: true,
          createdAt: '2023-10-15T00:00:00Z',
          updatedAt: '2023-10-28T00:00:00Z',
        },
        {
          id: 2,
          leadId: 2,
          lead: { id: 2, firstName: 'Emily', lastName: 'Johnson' } as any,
          projectId: 2,
          project: { id: 2, name: 'Skyline Towers' } as any,
          agentId: 2,
          agent: { id: 2, firstName: 'John', lastName: 'Doe' } as any,
          dealValue: 8500000,
          commissionRate: 2.5,
          commissionAmount: 212500,
          status: 'pending',
          notes: 'Office Space',
          closingDate: '2023-11-08',
          isActive: true,
          createdAt: '2023-10-10T00:00:00Z',
          updatedAt: '2023-10-29T00:00:00Z',
        },
        {
          id: 3,
          leadId: 5,
          lead: { id: 5, firstName: 'David', lastName: 'Wilson' } as any,
          projectId: 3,
          project: { id: 3, name: 'Golden Villas' } as any,
          agentId: 3,
          agent: { id: 3, firstName: 'Emily', lastName: 'Chen' } as any,
          dealValue: 25000000,
          commissionRate: 2.5,
          commissionAmount: 625000,
          status: 'completed',
          notes: 'Villa Purchase',
          closingDate: '2023-10-25',
          isActive: true,
          createdAt: '2023-09-20T00:00:00Z',
          updatedAt: '2023-10-25T00:00:00Z',
        },
        {
          id: 4,
          leadId: 3,
          lead: { id: 3, firstName: 'Michael', lastName: 'Brown' } as any,
          projectId: 4,
          project: { id: 4, name: 'Metro Business Park' } as any,
          agentId: 1,
          agent: { id: 1, firstName: 'Sarah', lastName: 'Wilson' } as any,
          dealValue: 15000000,
          commissionRate: 2.5,
          commissionAmount: 375000,
          status: 'pending',
          notes: 'Commercial Unit',
          closingDate: '2023-12-01',
          isActive: true,
          createdAt: '2023-10-20T00:00:00Z',
          updatedAt: '2023-10-30T00:00:00Z',
        },
        {
          id: 5,
          leadId: 4,
          lead: { id: 4, firstName: 'Lisa', lastName: 'Davis' } as any,
          projectId: 1,
          project: { id: 1, name: 'Phoenix Heights' } as any,
          agentId: 1,
          agent: { id: 1, firstName: 'Sarah', lastName: 'Wilson' } as any,
          dealValue: 9500000,
          commissionRate: 2.5,
          commissionAmount: 237500,
          status: 'draft',
          notes: '2BHK Investment',
          closingDate: '2023-12-15',
          isActive: true,
          createdAt: '2023-10-25T00:00:00Z',
          updatedAt: '2023-10-30T00:00:00Z',
        },
      ];
      
      setDeals(mockDeals);
    } catch (err: any) {
      setError(err.message || 'Failed to load deals');
    } finally {
      setLoading(false);
    }
  };

  const loadDealStats = async () => {
    try {
      // Calculate stats from current deals
      const totalValue = deals.reduce((sum, deal) => sum + (deal.dealValue || 0), 0);
      const wonDeals = deals.filter(deal => deal.status === 'completed').length;
      const avgDealSize = deals.length > 0 ? totalValue / deals.length : 0;
      const conversionRate = deals.length > 0 ? (wonDeals / deals.length) * 100 : 0;

      setDealStats({
        totalValue,
        wonDeals,
        avgDealSize,
        conversionRate,
      });
    } catch (err) {
      // Handle stats calculation error
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    try {
      const response = await dealsApi.deleteDeal(id);
      if (response.success) {
        setDeals(deals.filter(deal => deal.id !== id));
      } else {
        alert(response.message || 'Failed to delete deal');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete deal');
    }
  };

  const getDealsByStage = (stage: string) => {
    // Ensure deals is an array before filtering
    if (!Array.isArray(deals)) {
      return [];
    }
    
    // Map status to stage for backward compatibility with view
    const statusMap: Record<string, string[]> = {
      'Lead': ['draft'],
      'Qualified': ['pending'],
      'Proposal': ['approved'],
      'Negotiation': ['pending'],
      'Closed Won': ['completed'],
      'Closed Lost': ['cancelled', 'rejected'],
    };
    const statuses = statusMap[stage] || [];
    return deals.filter(deal => statuses.includes(deal.status));
  };

  const getStageValue = (stage: string) => {
    return getDealsByStage(stage).reduce((sum, deal) => sum + (deal.dealValue || 0), 0);
  };

  const getTrendIcon = (value: number) => {
    if (value > 0) return <ArrowUpIcon className="h-3 w-3 text-green-500" />;
    if (value < 0) return <ArrowDownIcon className="h-3 w-3 text-red-500" />;
    return <MinusIcon className="h-3 w-3 text-gray-500" />;
  };

  if (loading && deals.length === 0) {
    return (
      <DashboardLayout title="Deals">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Deals"
      actions={
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'pipeline' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pipeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              List
            </button>
          </div>
          <Link
            href="/deals/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm text-sm font-medium transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Deal
          </Link>
        </div>
      }
    >
      {/* Deal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Pipeline</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(dealStats.totalValue)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <CurrencyRupeeIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getTrendIcon(5.2)}
            <span className="text-sm text-gray-600 ml-1">5.2% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Won Deals</p>
              <p className="text-2xl font-bold text-gray-900">{dealStats.wonDeals}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <ArrowUpIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getTrendIcon(12.5)}
            <span className="text-sm text-gray-600 ml-1">12.5% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg Deal Size</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(dealStats.avgDealSize)}</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <CurrencyRupeeIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getTrendIcon(-2.1)}
            <span className="text-sm text-gray-600 ml-1">2.1% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Win Rate</p>
              <p className="text-2xl font-bold text-gray-900">{dealStats.conversionRate.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
              <ArrowUpIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {getTrendIcon(8.3)}
            <span className="text-sm text-gray-600 ml-1">8.3% from last month</span>
          </div>
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
                placeholder="Search deals by title, client name, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filters.stage || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value || undefined }))}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Stages</option>
              {dealStages.map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
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
              <h3 className="text-sm font-medium text-red-800">Error loading deals</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadDeals}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pipeline View */}
      {viewMode === 'pipeline' ? (
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {dealStages.map((stage) => {
            const stageDeals = getDealsByStage(stage);
            const stageValue = getStageValue(stage);
            
            return (
              <div key={stage} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">{stage}</h3>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{stageDeals.length} deals</p>
                    <p className="text-sm font-medium text-gray-900">{formatCurrency(stageValue)}</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {stageDeals.map((deal) => (
                    <div key={deal.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{deal.notes || `Deal #${deal.id}`}</h4>
                        <div className="flex items-center space-x-1 ml-2">
                          <Link
                            href={`/deals/${deal.id}`}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <EyeIcon className="h-3 w-3" />
                          </Link>
                          <Link
                            href={`/deals/${deal.id}/edit`}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <PencilIcon className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex items-center">
                          <UserIcon className="h-3 w-3 mr-1" />
                          {deal.lead?.name || 'Unknown Client'}
                        </div>
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                          {deal.project?.name || 'No Project'}
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {deal.closingDate ? formatDate(deal.closingDate) : 'No date set'}
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-gray-900">{formatCurrency(deal.dealValue || 0)}</span>
                          <span className="text-xs text-gray-500">{deal.commissionRate || 0}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {stageDeals.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No deals in this stage</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Probability
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Close Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{deal.notes || `Deal #${deal.id}`}</div>
                        <div className="text-sm text-gray-500">ID: {deal.id}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{deal.lead?.name || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{deal.project?.name || 'No Project'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(deal.dealValue || 0)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageColors[deal.status as keyof typeof stageColors] || 'bg-gray-100 text-gray-800'}`}>
                        {deal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{deal.commissionRate || 0}%</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {deal.closingDate ? formatDate(deal.closingDate) : 'Not set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/deals/${deal.id}`}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/deals/${deal.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(deal.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
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
        </div>
      )}

      {/* Empty State */}
      {deals.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            <CurrencyRupeeIcon className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No deals found</h3>
          <p className="text-gray-500 mb-6">
            Start managing your sales pipeline by creating your first deal.
          </p>
          <Link
            href="/deals/new"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create First Deal
          </Link>
        </div>
      )}

      {/* Loading More */}
      {loading && deals.length > 0 && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}
    </DashboardLayout>
  );
}