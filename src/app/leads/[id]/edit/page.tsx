'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import LeadForm from '@/components/forms/LeadForm';
import { leadsApi } from '@/lib/api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function EditLeadPage() {
  const params = useParams();
  const leadId = parseInt(params.id as string);
  
  const [leadData, setLeadData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (leadId) {
      loadLead();
    }
  }, [leadId]);

  const loadLead = async () => {
    try {
      setLoading(true);
      const response = await leadsApi.getLead(leadId);
      
      if (response.success && response.data) {
        setLeadData({
          id: response.data.id,
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone,
          alternatePhone: response.data.alternatePhone,
          source: response.data.source?.name,
          statusId: response.data.statusId,
          assignedToId: response.data.assignedToId,
          budget: response.data.budget,
          requirements: response.data.requirements,
          notes: response.data.notes,
          nextFollowUp: response.data.nextFollowUp,
        });
      }
    } catch (err) {
      console.error('Error loading lead:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Edit Lead">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Edit Lead"
      actions={
        <Link
          href={`/leads/${leadId}`}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Details
        </Link>
      }
    >
      {leadData ? (
        <LeadForm initialData={leadData} />
      ) : (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">Lead not found</p>
        </div>
      )}
    </DashboardLayout>
  );
}
