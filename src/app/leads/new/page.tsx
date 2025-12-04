'use client';

import DashboardLayout from '@/components/DashboardLayout';
import LeadForm from '@/components/forms/LeadForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function NewLeadPage() {
  return (
    <DashboardLayout
      title="Create New Lead"
      actions={
        <Link
          href="/leads"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Leads
        </Link>
      }
    >
      <LeadForm />
    </DashboardLayout>
  );
}
