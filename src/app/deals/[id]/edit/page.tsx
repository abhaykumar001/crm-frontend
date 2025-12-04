'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';
import DealForm from '@/components/forms/DealForm';
import api from '@/lib/api';

export default function EditDealPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [deal, setDeal] = useState<any>(null);
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
        projectId: '1',
        leadId: '1',
        assignedAgentId: '1',
        status: 'negotiation',
        dealValue: 7500000,
        commissionRate: 2.5,
        commissionAmount: 187500,
        unitNumber: '501',
        floorNumber: 5,
        carpetArea: 1200,
        expectedClosingDate: '2025-12-15',
        notes: 'Client is interested in premium finishing.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    router.push(`/deals/${params.id}`);
  };

  const handleCancel = () => {
    router.back();
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
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          onClick={() => router.back()}
        >
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Deal
          </h1>
          <p className="text-gray-600 mt-1">Update deal information and status</p>
        </div>
      </div>

      {/* Form */}
      <DealForm
        dealId={params.id}
        initialData={deal}
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}
