'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, PencilIcon, TrashIcon, UserIcon, BuildingOfficeIcon, CurrencyRupeeIcon, CalendarIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Button, Card, Badge } from '@/components/ui';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Deal {
  id: string;
  title: string;
  project: { id: string; name: string };
  lead: { id: string; firstName: string; lastName: string; email: string; phone: string };
  assignedAgent: { id: string; firstName: string; lastName: string };
  status: string;
  dealValue: number;
  commissionRate: number;
  commissionAmount: number;
  unitNumber?: string;
  floorNumber?: number;
  carpetArea?: number;
  closingDate?: string;
  expectedClosingDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DealDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDeal();
  }, [params.id]);

  const loadDeal = async () => {
    try {
      const response = await api.get(`/deals/${params.id}`);
      setDeal(response.data);
    } catch (error) {
      console.error('Error loading deal:', error);
      // Mock data fallback
      setDeal({
        id: params.id,
        title: 'Luxury Apartment Sale - Unit 501',
        project: { id: '1', name: 'Skyline Residences' },
        lead: { 
          id: '1', 
          firstName: 'John', 
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+91 9876543210'
        },
        assignedAgent: { id: '1', firstName: 'Sarah', lastName: 'Agent' },
        status: 'negotiation',
        dealValue: 7500000,
        commissionRate: 2.5,
        commissionAmount: 187500,
        unitNumber: '501',
        floorNumber: 5,
        carpetArea: 1200,
        expectedClosingDate: '2025-12-15',
        notes: 'Client is interested in premium finishing. Ready to close by year end.',
        createdAt: '2025-10-01T10:00:00Z',
        updatedAt: '2025-10-30T15:30:00Z',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this deal?')) return;

    try {
      await api.delete(`/deals/${params.id}`);
      toast.success('Deal deleted successfully');
      router.push('/deals');
    } catch (error) {
      toast.error('Failed to delete deal');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
      pending: 'default',
      negotiation: 'info',
      contract_sent: 'warning',
      contract_signed: 'info',
      payment_pending: 'warning',
      completed: 'success',
      cancelled: 'danger',
    };
    return variants[status] || 'default';
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Deal not found</h3>
        <Button variant="outline" onClick={() => router.push('/deals')}>
          Back to Deals
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
            onClick={() => router.push('/deals')}
          >
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{deal.title}</h1>
            <p className="text-gray-600 mt-1">Deal ID: #{deal.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            leftIcon={<PencilIcon className="h-5 w-5" />}
            onClick={() => router.push(`/deals/${deal.id}/edit`)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            leftIcon={<TrashIcon className="h-5 w-5" />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Status and Values Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge variant={getStatusBadgeVariant(deal.status)} size="md">
                {formatStatus(deal.status)}
              </Badge>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CurrencyRupeeIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Deal Value</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(deal.dealValue)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CurrencyRupeeIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Commission</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(deal.commissionAmount)}</p>
              <p className="text-xs text-gray-500">({deal.commissionRate}%)</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CalendarIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Expected Close</p>
              <p className="text-sm font-medium text-gray-900">
                {deal.expectedClosingDate ? formatDate(deal.expectedClosingDate) : 'Not set'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project and Client Information */}
          <Card title="Deal Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-600">Project</h3>
                </div>
                <p className="text-lg font-semibold text-gray-900">{deal.project.name}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-600">Client</h3>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {deal.lead.firstName} {deal.lead.lastName}
                </p>
                <p className="text-sm text-gray-600">{deal.lead.email}</p>
                <p className="text-sm text-gray-600">{deal.lead.phone}</p>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <h3 className="text-sm font-medium text-gray-600">Assigned Agent</h3>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {deal.assignedAgent.firstName} {deal.assignedAgent.lastName}
                </p>
              </div>
            </div>
          </Card>

          {/* Property Details */}
          <Card title="Property Details">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {deal.unitNumber && (
                <div>
                  <p className="text-sm text-gray-600">Unit Number</p>
                  <p className="text-lg font-semibold text-gray-900">{deal.unitNumber}</p>
                </div>
              )}
              {deal.floorNumber !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Floor</p>
                  <p className="text-lg font-semibold text-gray-900">{deal.floorNumber}</p>
                </div>
              )}
              {deal.carpetArea && (
                <div>
                  <p className="text-sm text-gray-600">Carpet Area</p>
                  <p className="text-lg font-semibold text-gray-900">{deal.carpetArea} sq ft</p>
                </div>
              )}
            </div>
          </Card>

          {/* Financial Details */}
          <Card title="Financial Details">
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Deal Value</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(deal.dealValue)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Commission Rate</span>
                <span className="text-lg font-semibold text-gray-900">{deal.commissionRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Commission Amount</span>
                <span className="text-xl font-bold text-green-600">{formatCurrency(deal.commissionAmount)}</span>
              </div>
            </div>
          </Card>

          {/* Notes */}
          {deal.notes && (
            <Card title="Notes">
              <div className="flex gap-3">
                <DocumentTextIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                <p className="text-gray-700 whitespace-pre-wrap">{deal.notes}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Timeline and Additional Info */}
        <div className="space-y-6">
          {/* Timeline Card */}
          <Card title="Timeline">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Created Date</p>
                <p className="text-gray-900 font-medium">{formatDate(deal.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                <p className="text-gray-900 font-medium">{formatDate(deal.updatedAt)}</p>
              </div>
              {deal.expectedClosingDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Expected Closing</p>
                  <p className="text-gray-900 font-medium">{formatDate(deal.expectedClosingDate)}</p>
                </div>
              )}
              {deal.closingDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Actual Closing</p>
                  <p className="text-green-600 font-semibold">{formatDate(deal.closingDate)}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions Card */}
          <Card title="Quick Actions">
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/leads/${deal.lead.id}`)}
              >
                View Client Details
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/projects/${deal.project.id}`)}
              >
                View Project
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/deals/${deal.id}/edit`)}
              >
                Update Status
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
