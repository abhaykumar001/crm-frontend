'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { sourceApi, campaignApi } from '@/lib/api';
import { Button, Card, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Source {
  id: number;
  name: string;
  type?: string;
  campaignId?: number;
  isActive: boolean;
  runAllTime: boolean;
  isCroned: boolean;
  rotationType?: string;
  priority?: number;
  createdAt: string;
  updatedAt: string;
  campaign?: {
    id: number;
    name: string;
    isInternational: boolean;
  };
  _count?: {
    leads: number;
    sourceUsers: number;
    subSources: number;
  };
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    loadSources();
  }, [typeFilter, campaignFilter, activeFilter]);

  const loadCampaigns = async () => {
    try {
      const response = await campaignApi.getAllCampaigns({ status: 1 });
      if (response.success) {
        setCampaigns(response.data || []);
      }
    } catch (err) {
      console.error('Error loading campaigns:', err);
    }
  };

  const loadSources = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: any = {};
      if (typeFilter !== 'all') params.type = typeFilter;
      if (campaignFilter !== 'all') params.campaignId = parseInt(campaignFilter);
      if (activeFilter !== 'all') params.isActive = activeFilter === 'true';
      if (searchTerm) params.search = searchTerm;

      const response = await sourceApi.getAllSources(params);
      
      if (response.success) {
        setSources(response.data || []);
      } else {
        throw new Error(response.message || 'Failed to load sources');
      }
    } catch (err: any) {
      console.error('Error loading sources:', err);
      setError(err.message || 'Failed to load sources');
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadSources();
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete source "${name}"?`)) return;

    try {
      const response = await sourceApi.deleteSource(id);
      if (response.success) {
        loadSources();
      } else {
        alert(response.message || 'Failed to delete source');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete source');
    }
  };

  const getTypeBadge = (type?: string) => {
    if (type === 'Campaign') {
      return <Badge variant="primary">Campaign</Badge>;
    }
    return <Badge variant="default">Normal</Badge>;
  };

  return (
    <DashboardLayout
      title="Lead Sources"
      actions={
        <div className="flex items-center space-x-3">
          <Button
            variant="secondary"
            leftIcon={<FunnelIcon className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Link href="/sources/new">
            <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
              Create Source
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
                placeholder="Search sources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
          <Button type="submit">Search</Button>
        </form>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Source Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="Normal">Normal</option>
                <option value="Campaign">Campaign</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign
              </label>
              <select
                value={campaignFilter}
                onChange={(e) => setCampaignFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Campaigns</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading sources...</p>
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
      {!loading && !error && sources.length === 0 && (
        <Card className="text-center py-12">
          <UserGroupIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sources found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || typeFilter !== 'all' || campaignFilter !== 'all' || activeFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first lead source'}
          </p>
          <Link href="/sources/new">
            <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
              Create Source
            </Button>
          </Link>
        </Card>
      )}

      {/* Sources Grid */}
      {!loading && !error && sources.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sources.map((source) => (
            <Card key={source.id} className="hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {source.name}
                    </h3>
                    {source.runAllTime && (
                      <ClockIcon className="w-5 h-5 text-blue-600" title="24/7 Operations" />
                    )}
                  </div>
                  {source.campaign && (
                    <p className="text-sm text-gray-600 flex items-center">
                      {source.campaign.isInternational && (
                        <GlobeAltIcon className="w-4 h-4 mr-1" />
                      )}
                      {source.campaign.name}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {getTypeBadge(source.type)}
                  <Badge variant={source.isActive ? 'success' : 'default'}>
                    {source.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                {source.rotationType && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rotation:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {source.rotationType.replace('_', ' ')}
                    </span>
                  </div>
                )}
                
                {source.isCroned && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Auto-Distribution:</span>
                    <Badge variant="success" size="sm">Enabled</Badge>
                  </div>
                )}

                {source.priority !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Priority:</span>
                    <span className="font-medium text-gray-900">{source.priority}</span>
                  </div>
                )}
              </div>

              {source._count && (
                <div className="grid grid-cols-3 gap-2 mb-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {source._count.leads}
                    </div>
                    <div className="text-xs text-gray-600">Leads</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {source._count.sourceUsers}
                    </div>
                    <div className="text-xs text-gray-600">Agents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">
                      {source._count.subSources}
                    </div>
                    <div className="text-xs text-gray-600">Sub-Sources</div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-4 border-t border-gray-200">
                <Link href={`/sources/${source.id}`} className="flex-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<EyeIcon className="w-4 h-4" />}
                    className="w-full"
                  >
                    View
                  </Button>
                </Link>
                <Link href={`/sources/${source.id}/edit`} className="flex-1">
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
                  onClick={() => handleDelete(source.id, source.name)}
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
