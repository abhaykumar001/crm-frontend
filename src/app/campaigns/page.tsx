'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { campaignApi } from '@/lib/api';
import { Button, Card, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  GlobeAltIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface Campaign {
  id: number;
  name: string;
  secondaryName?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  status: number;
  isInternational: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    leads: number;
    sources: number;
    managers: number;
  };
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [internationalFilter, setInternationalFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, [statusFilter, internationalFilter]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (statusFilter !== 'all') params.status = parseInt(statusFilter);
      if (internationalFilter !== 'all') params.isInternational = internationalFilter === 'true';
      if (searchTerm) params.search = searchTerm;

      const response = await campaignApi.getAllCampaigns(params);
      
      if (response.success) {
        setCampaigns(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to load campaigns');
      }
    } catch (err: any) {
      console.error('Error loading campaigns:', err);
      setError(err.message || 'Failed to load campaigns');
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCampaigns();
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete campaign "${name}"?`)) return;

    try {
      const response = await campaignApi.deleteCampaign(id);
      if (response.success) {
        loadCampaigns();
      } else {
        alert(response.message || 'Failed to delete campaign');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete campaign');
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <Badge variant="success">Active</Badge>;
      case 0:
        return <Badge variant="default">Inactive</Badge>;
      case 2:
        return <Badge variant="warning">Paused</Badge>;
      case 3:
        return <Badge variant="danger">Completed</Badge>;
      default:
        return <Badge variant="default">Unknown</Badge>;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <DashboardLayout
      title="Campaigns"
      actions={
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            leftIcon={<FunnelIcon className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Link href="/campaigns/new">
            <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
              Create Campaign
            </Button>
          </Link>
        </div>
      }
    >
      {/* Search and Filters */}
      <Card className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <Button type="submit">Search</Button>
        </form>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
                <option value="2">Paused</option>
                <option value="3">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Type
              </label>
              <select
                value={internationalFilter}
                onChange={(e) => setInternationalFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Campaigns</option>
                <option value="false">Domestic</option>
                <option value="true">International</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading campaigns...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center space-x-2 text-red-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && !error && campaigns.length === 0 && (
        <Card className="text-center py-12">
          <ChartBarIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' || internationalFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first campaign'}
          </p>
          <Link href="/campaigns/new">
            <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
              Create Campaign
            </Button>
          </Link>
        </Card>
      )}

      {/* Campaigns Grid */}
      {!loading && !error && campaigns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {campaign.name}
                    </h3>
                    {campaign.isInternational && (
                      <GlobeAltIcon className="w-5 h-5 text-blue-600" title="International Campaign" />
                    )}
                  </div>
                  {campaign.secondaryName && (
                    <p className="text-sm text-gray-600">{campaign.secondaryName}</p>
                  )}
                </div>
                <div>{getStatusBadge(campaign.status)}</div>
              </div>

              {campaign.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {campaign.description}
                </p>
              )}

              <div className="space-y-2 mb-4 text-sm">
                {campaign.budget && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(campaign.budget)}
                    </span>
                  </div>
                )}
                
                {campaign.startDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Start Date:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(campaign.startDate)}
                    </span>
                  </div>
                )}

                {campaign.endDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">End Date:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(campaign.endDate)}
                    </span>
                  </div>
                )}
              </div>

              {campaign._count && (
                <div className="grid grid-cols-3 gap-2 mb-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {campaign._count.leads}
                    </div>
                    <div className="text-xs text-gray-600">Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {campaign._count.sources}
                    </div>
                    <div className="text-xs text-gray-600">Sources</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {campaign._count.managers}
                    </div>
                    <div className="text-xs text-gray-600">Managers</div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                <Link href={`/campaigns/${campaign.id}`} className="flex-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<EyeIcon className="w-4 h-4" />}
                    className="w-full"
                  >
                    View
                  </Button>
                </Link>
                <Link href={`/campaigns/${campaign.id}/edit`} className="flex-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<PencilIcon className="w-4 h-4" />}
                    className="w-full"
                  >
                    Edit
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(campaign.id, campaign.name)}
                  leftIcon={<TrashIcon className="w-4 h-4" />}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
