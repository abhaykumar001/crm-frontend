'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { Badge, Button, Card } from '@/components/ui';
import { leadsApi } from '@/lib/api';
import { Lead } from '@/types';
import { formatDate, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  UserIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = parseInt(params.id as string);
  
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setLead(response.data);
      } else {
        setError('Lead not found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load lead');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lead?')) return;

    try {
      const response = await leadsApi.deleteLead(leadId);
      if (response.success) {
        toast.success('Lead deleted successfully');
        router.push('/leads');
      } else {
        toast.error(response.message || 'Failed to delete lead');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete lead');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Lead Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !lead) {
    return (
      <DashboardLayout title="Lead Details">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error || 'Lead not found'}</p>
          <Link
            href="/leads"
            className="mt-4 inline-flex items-center text-red-600 hover:text-red-800"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Leads
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Lead Details"
      actions={
        <div className="flex items-center space-x-3">
          <Link
            href="/leads"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Link>
          <Link
            href={`/leads/${leadId}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit
          </Link>
          <Button
            variant="danger"
            onClick={handleDelete}
            leftIcon={<TrashIcon className="h-4 w-4" />}
          >
            Delete
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card title="Contact Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <p className="text-gray-900 font-medium">{lead.name}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <a href={`mailto:${lead.email}`} className="text-blue-600 hover:text-blue-800">
                    {lead.email}
                  </a>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <a href={`tel:${lead.phone}`} className="text-blue-600 hover:text-blue-800">
                    {lead.phone}
                  </a>
                </div>
              </div>

              {lead.alternatePhone && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Alternate Phone</label>
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <a href={`tel:${lead.alternatePhone}`} className="text-blue-600 hover:text-blue-800">
                      {lead.alternatePhone}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Requirements */}
          {lead.requirements && (
            <Card title="Requirements">
              <p className="text-gray-700 whitespace-pre-wrap">{lead.requirements}</p>
            </Card>
          )}

          {/* Notes */}
          {lead.notes && typeof lead.notes === 'string' && (
            <Card title="Notes">
              <p className="text-gray-700 whitespace-pre-wrap">{lead.notes}</p>
            </Card>
          )}
          
          {/* Notes Array (from API) */}
          {lead.notes && Array.isArray(lead.notes) && lead.notes.length > 0 && (
            <Card title="Notes">
              <div className="space-y-3">
                {lead.notes.map((note: any, index: number) => (
                  <div key={note.id || index} className="border-l-2 border-blue-500 pl-3 py-2">
                    <p className="text-gray-700 text-sm">{note.content}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <span>{note.user?.name || 'Unknown'}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(note.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status & Source */}
          <Card title="Status & Source">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Status</label>
                <Badge variant="info" size="lg">
                  {lead.status?.name || 'Unknown'}
                </Badge>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">Source</label>
                <Badge variant="default" size="lg">
                  {lead.source?.name || 'Unknown'}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Assignment */}
          <Card title="Assignment">
            {lead.assignedTo ? (
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium mr-3">
                  {lead.assignedTo.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{lead.assignedTo.name}</p>
                  <p className="text-sm text-gray-500">{lead.assignedTo.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">Unassigned</p>
            )}
          </Card>

          {/* Budget */}
          {lead.budget && (
            <Card title="Budget">
              <div className="flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 text-gray-400 mr-2" />
                <p className="text-lg font-semibold text-gray-900">{formatCurrency(lead.budget)}</p>
              </div>
            </Card>
          )}

          {/* Timeline */}
          <Card title="Timeline">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
                <div className="flex items-center text-sm text-gray-900">
                  <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                  {formatDate(lead.createdAt)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                <div className="flex items-center text-sm text-gray-900">
                  <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                  {formatDate(lead.updatedAt)}
                </div>
              </div>

              {lead.nextFollowUp && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Next Follow-up</label>
                  <div className="flex items-center text-sm text-gray-900">
                    <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                    {formatDate(lead.nextFollowUp)}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Lead Score */}
          {lead.score !== undefined && (
            <Card title="Lead Score">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Score</span>
                <span className="text-2xl font-bold text-blue-600">{lead.score}/100</span>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${lead.score}%` }}
                />
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
