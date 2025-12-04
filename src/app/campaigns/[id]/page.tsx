'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { campaignApi, usersApi } from '@/lib/api';
import { Button, Card, Badge, Modal } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import {
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  GlobeAltIcon,
  UserPlusIcon,
  XMarkIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  FunnelIcon,
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
}

interface CampaignPerformance {
  totalLeads: number;
  convertedLeads: number;
  totalRevenue: number;
  totalCost: number;
  roi: number;
  conversionRate: number;
  costPerLead: number;
  costPerConversion: number;
  leadsByStatus: Record<string, number>;
  leadsBySource: Record<string, number>;
}

interface Manager {
  id: number;
  userId: number;
  campaignId: number;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export default function CampaignDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = parseInt(params.id as string);

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [performance, setPerformance] = useState<CampaignPerformance | null>(null);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showAddManagerModal, setShowAddManagerModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    loadCampaignDetails();
  }, [campaignId]);

  const loadCampaignDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const [campaignRes, performanceRes, managersRes] = await Promise.all([
        campaignApi.getCampaignById(campaignId),
        campaignApi.getCampaignPerformance(campaignId),
        campaignApi.getCampaignManagers(campaignId),
      ]);

      if (campaignRes.success) {
        setCampaign(campaignRes.data);
      } else {
        throw new Error(campaignRes.message || 'Failed to load campaign');
      }

      if (performanceRes.success) {
        setPerformance(performanceRes.data);
      }

      if (managersRes.success) {
        setManagers(managersRes.data || []);
      }
    } catch (err: any) {
      console.error('Error loading campaign:', err);
      setError(err.message || 'Failed to load campaign details');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const response = await usersApi.getUsers({ role: 'manager' });
      if (response.success) {
        // Filter out users who are already managers
        const managerUserIds = managers.map(m => m.userId);
        const available = (response.data || []).filter(
          (user: any) => !managerUserIds.includes(user.id)
        );
        setAvailableUsers(available);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleAddManager = async () => {
    if (!selectedUserId) return;

    try {
      const response = await campaignApi.addCampaignManager(
        campaignId,
        parseInt(selectedUserId)
      );

      if (response.success) {
        setShowAddManagerModal(false);
        setSelectedUserId('');
        loadCampaignDetails();
      } else {
        alert(response.message || 'Failed to add manager');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add manager');
    }
  };

  const handleRemoveManager = async (userId: number, userName: string) => {
    if (!confirm(`Remove ${userName} as campaign manager?`)) return;

    try {
      const response = await campaignApi.removeCampaignManager(campaignId, userId);
      
      if (response.success) {
        loadCampaignDetails();
      } else {
        alert(response.message || 'Failed to remove manager');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove manager');
    }
  };

  const handleDelete = async () => {
    if (!campaign) return;
    if (!confirm(`Are you sure you want to delete campaign "${campaign.name}"?`)) return;

    try {
      const response = await campaignApi.deleteCampaign(campaignId);
      if (response.success) {
        router.push('/campaigns');
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
        return <Badge variant="secondary">Inactive</Badge>;
      case 2:
        return <Badge variant="warning">Paused</Badge>;
      case 3:
        return <Badge variant="danger">Completed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount && amount !== 0) return 'N/A';
    return new Intl.NumberFormat('en-AE', {
      style: 'currency',
      currency: 'AED',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value?: number) => {
    if (!value && value !== 0) return 'N/A';
    return `${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <DashboardLayout title="Campaign Details" subtitle="Loading...">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading campaign details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !campaign) {
    return (
      <DashboardLayout title="Campaign Details" subtitle="Error">
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center space-x-2 text-red-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error || 'Campaign not found'}</span>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={campaign.name}
      subtitle={campaign.secondaryName || 'Campaign Details'}
      actions={
        <div className="flex items-center space-x-3">
          <Link href="/campaigns">
            <Button variant="secondary" leftIcon={<ArrowLeftIcon className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <Link href={`/campaigns/${campaign.id}/edit`}>
            <Button variant="secondary" leftIcon={<PencilIcon className="w-4 h-4" />}>
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            leftIcon={<TrashIcon className="w-4 h-4" />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Info */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Campaign Information</h2>
              <div className="flex items-center space-x-2">
                {getStatusBadge(campaign.status)}
                {campaign.isInternational && (
                  <Badge variant="info">
                    <GlobeAltIcon className="w-4 h-4 mr-1 inline" />
                    International
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {campaign.description && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <p className="text-gray-900">{campaign.description}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaign.budget && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Budget
                    </label>
                    <p className="text-lg font-semibold text-gray-900">
                      {formatCurrency(campaign.budget)}
                    </p>
                  </div>
                )}

                {campaign.startDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Start Date
                    </label>
                    <p className="text-gray-900">{formatDate(campaign.startDate)}</p>
                  </div>
                )}

                {campaign.endDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      End Date
                    </label>
                    <p className="text-gray-900">{formatDate(campaign.endDate)}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Created
                  </label>
                  <p className="text-gray-900">{formatDate(campaign.createdAt)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Performance Metrics */}
          {performance && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Metrics</h2>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <FunnelIcon className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-900">
                    {performance.totalLeads}
                  </div>
                  <div className="text-sm text-blue-700">Total Leads</div>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <ChartBarIcon className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-900">
                    {performance.convertedLeads}
                  </div>
                  <div className="text-sm text-green-700">Converted</div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <CurrencyDollarIcon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-900">
                    {formatPercentage(performance.conversionRate)}
                  </div>
                  <div className="text-sm text-purple-700">Conversion Rate</div>
                </div>

                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <ChartBarIcon className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-amber-900">
                    {formatPercentage(performance.roi)}
                  </div>
                  <div className="text-sm text-amber-700">ROI</div>
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total Revenue</div>
                  <div className="text-xl font-semibold text-green-600">
                    {formatCurrency(performance.totalRevenue)}
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Total Cost</div>
                  <div className="text-xl font-semibold text-red-600">
                    {formatCurrency(performance.totalCost)}
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Cost Per Lead</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {formatCurrency(performance.costPerLead)}
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Cost Per Conversion</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {formatCurrency(performance.costPerConversion)}
                  </div>
                </div>
              </div>

              {/* Lead Distribution */}
              {performance.leadsByStatus && Object.keys(performance.leadsByStatus).length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Leads by Status</h3>
                  <div className="space-y-2">
                    {Object.entries(performance.leadsByStatus).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <span className="text-gray-700">{status}</span>
                        <span className="font-semibold text-gray-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Sidebar - Right Column */}
        <div className="space-y-6">
          {/* Campaign Managers */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Campaign Managers</h2>
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<UserPlusIcon className="w-4 h-4" />}
                onClick={() => {
                  loadAvailableUsers();
                  setShowAddManagerModal(true);
                }}
              >
                Add
              </Button>
            </div>

            {managers.length === 0 ? (
              <p className="text-gray-500 text-sm">No managers assigned yet</p>
            ) : (
              <div className="space-y-2">
                {managers.map((manager) => (
                  <div
                    key={manager.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{manager.user.name}</div>
                      <div className="text-sm text-gray-600">{manager.user.email}</div>
                    </div>
                    <button
                      onClick={() => handleRemoveManager(manager.userId, manager.user.name)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add Manager Modal */}
      {showAddManagerModal && (
        <Modal
          isOpen={showAddManagerModal}
          onClose={() => setShowAddManagerModal(false)}
          title="Add Campaign Manager"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Manager
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select a user...</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowAddManagerModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddManager}
                disabled={!selectedUserId}
                className="flex-1"
              >
                Add Manager
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
