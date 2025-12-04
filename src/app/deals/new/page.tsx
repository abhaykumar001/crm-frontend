'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';
import DealForm from '@/components/forms/DealForm';

const NewDealPage = () => {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/deals');
  };

  const handleCancel = () => {
    router.back();
  };

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create New Deal
          </h1>
          <p className="text-gray-600 mt-1">Add a new property deal to your pipeline</p>
        </div>
      </div>

      {/* Form */}
      <DealForm onSuccess={handleSuccess} onCancel={handleCancel} />
    </div>
  );
};

export default NewDealPage;
