'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { campaignApi } from '@/lib/api';
import { Button, Card } from '@/components/ui';
import {
  ArrowLeftIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export default function CampaignFormPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id ? parseInt(params.id as string) : null;
  const isEditMode = !!campaignId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    secondaryName: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
    status: '1',
    isInternational: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditMode) {
      loadCampaign();
    }
  }, [campaignId]);

  const loadCampaign = async () => {
    if (!campaignId) return;

    try {
      setLoading(true);
      const response = await campaignApi.getCampaignById(campaignId);
      
      if (response.success && response.data) {
        const campaign = response.data;
        setFormData({
          name: campaign.name || '',
          secondaryName: campaign.secondaryName || '',
          description: campaign.description || '',
          startDate: campaign.startDate ? campaign.startDate.split('T')[0] : '',
          endDate: campaign.endDate ? campaign.endDate.split('T')[0] : '',
          budget: campaign.budget ? campaign.budget.toString() : '',
          status: campaign.status.toString(),
          isInternational: campaign.isInternational || false,
        });
      } else {
        throw new Error(response.message || 'Failed to load campaign');
      }
    } catch (err: any) {
      console.error('Error loading campaign:', err);
      setError(err.message || 'Failed to load campaign');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    if (formData.budget && isNaN(parseFloat(formData.budget))) {
      newErrors.budget = 'Budget must be a valid number';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const submitData: any = {
        name: formData.name.trim(),
        status: parseInt(formData.status),
        isInternational: formData.isInternational,
      };

      if (formData.secondaryName.trim()) {
        submitData.secondaryName = formData.secondaryName.trim();
      }

      if (formData.description.trim()) {
        submitData.description = formData.description.trim();
      }

      if (formData.startDate) {
        submitData.startDate = new Date(formData.startDate).toISOString();
      }

      if (formData.endDate) {
        submitData.endDate = new Date(formData.endDate).toISOString();
      }

      if (formData.budget) {
        submitData.budget = parseFloat(formData.budget);
      }

      let response;
      if (isEditMode && campaignId) {
        response = await campaignApi.updateCampaign(campaignId, submitData);
      } else {
        response = await campaignApi.createCampaign(submitData);
      }

      if (response.success) {
        router.push('/campaigns');
      } else {
        throw new Error(response.message || 'Failed to save campaign');
      }
    } catch (err: any) {
      console.error('Error saving campaign:', err);
      setError(err.message || 'Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout
        title={isEditMode ? 'Edit Campaign' : 'Create Campaign'}
        subtitle="Loading..."
      >
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading campaign...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={isEditMode ? 'Edit Campaign' : 'Create Campaign'}
      subtitle={isEditMode ? 'Update campaign details' : 'Create a new marketing campaign'}
      actions={
        <Link href="/campaigns">
          <Button variant="secondary" leftIcon={<ArrowLeftIcon className="w-4 h-4" />}>
            Back to Campaigns
          </Button>
        </Link>
      }
    >
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <div className="flex items-center space-x-2 text-red-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </Card>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Campaign Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter campaign name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Secondary Name */}
              <div>
                <label htmlFor="secondaryName" className="block text-sm font-medium text-gray-700 mb-2">
                  Secondary Name
                </label>
                <input
                  type="text"
                  id="secondaryName"
                  name="secondaryName"
                  value={formData.secondaryName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter secondary name (optional)"
                />
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter campaign description"
              />
            </div>
          </div>

          {/* Campaign Details */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                )}
              </div>

              {/* Budget */}
              <div>
                <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                  Budget (AED)
                </label>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.budget ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter budget amount"
                />
                {errors.budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.budget}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                  <option value="2">Paused</option>
                  <option value="3">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Campaign Settings */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Settings</h3>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isInternational"
                name="isInternational"
                checked={formData.isInternational}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="isInternational" className="ml-2 block text-sm text-gray-900">
                International Campaign (24/7 operations)
              </label>
            </div>
            <p className="mt-1 ml-6 text-sm text-gray-500">
              Enable this for campaigns targeting international markets with round-the-clock operations
            </p>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-200 flex justify-end space-x-3">
            <Link href="/campaigns">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              leftIcon={saving ? undefined : <CheckIcon className="w-4 h-4" />}
            >
              {saving ? 'Saving...' : isEditMode ? 'Update Campaign' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}
