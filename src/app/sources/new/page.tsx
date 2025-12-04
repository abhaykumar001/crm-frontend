'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { sourceApi, campaignApi } from '@/lib/api';
import { Button, Card } from '@/components/ui';
import {
  ArrowLeftIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

export default function SourceFormPage() {
  const params = useParams();
  const router = useRouter();
  const sourceId = params.id ? parseInt(params.id as string) : null;
  const isEditMode = !!sourceId;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    type: 'Normal',
    campaignId: '',
    isActive: true,
    runAllTime: false,
    isCroned: false,
    rotationType: 'round_robin',
    priority: '1',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCampaigns();
    if (isEditMode) {
      loadSource();
    }
  }, [sourceId]);

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

  const loadSource = async () => {
    if (!sourceId) return;

    try {
      setLoading(true);
      const response = await sourceApi.getSourceById(sourceId);
      
      if (response.success && response.data) {
        const source = response.data;
        setFormData({
          name: source.name || '',
          type: source.type || 'Normal',
          campaignId: source.campaignId ? source.campaignId.toString() : '',
          isActive: source.isActive !== undefined ? source.isActive : true,
          runAllTime: source.runAllTime || false,
          isCroned: source.isCroned || false,
          rotationType: source.rotationType || 'round_robin',
          priority: source.priority ? source.priority.toString() : '1',
        });
      } else {
        throw new Error(response.message || 'Failed to load source');
      }
    } catch (err: any) {
      console.error('Error loading source:', err);
      setError(err.message || 'Failed to load source');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Source name is required';
    }

    if (formData.type === 'Campaign' && !formData.campaignId) {
      newErrors.campaignId = 'Campaign is required for Campaign type sources';
    }

    if (formData.priority && isNaN(parseInt(formData.priority))) {
      newErrors.priority = 'Priority must be a valid number';
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
        type: formData.type,
        isActive: formData.isActive,
        runAllTime: formData.runAllTime,
        isCroned: formData.isCroned,
        rotationType: formData.rotationType,
        priority: parseInt(formData.priority),
      };

      if (formData.campaignId) {
        submitData.campaignId = parseInt(formData.campaignId);
      }

      let response;
      if (isEditMode && sourceId) {
        response = await sourceApi.updateSource(sourceId, submitData);
      } else {
        response = await sourceApi.createSource(submitData);
      }

      if (response.success) {
        router.push('/sources');
      } else {
        throw new Error(response.message || 'Failed to save source');
      }
    } catch (err: any) {
      console.error('Error saving source:', err);
      setError(err.message || 'Failed to save source');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
        title={isEditMode ? 'Edit Source' : 'Create Source'}
        subtitle="Loading..."
      >
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading source...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={isEditMode ? 'Edit Source' : 'Create Source'}
      subtitle={isEditMode ? 'Update source configuration' : 'Create a new lead source'}
      actions={
        <Link href="/sources">
          <Button variant="secondary" leftIcon={<ArrowLeftIcon className="w-4 h-4" />}>
            Back to Sources
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
              {/* Source Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Source Name <span className="text-red-500">*</span>
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
                  placeholder="Enter source name (e.g., Facebook Ads)"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Source Type */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Source Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Normal">Normal</option>
                  <option value="Campaign">Campaign</option>
                </select>
              </div>
            </div>
          </div>

          {/* Campaign Association */}
          {formData.type === 'Campaign' && (
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Association</h3>
              
              <div>
                <label htmlFor="campaignId" className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign <span className="text-red-500">*</span>
                </label>
                <select
                  id="campaignId"
                  name="campaignId"
                  value={formData.campaignId}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.campaignId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select a campaign...</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name} {campaign.isInternational ? '(International)' : ''}
                    </option>
                  ))}
                </select>
                {errors.campaignId && (
                  <p className="mt-1 text-sm text-red-600">{errors.campaignId}</p>
                )}
              </div>
            </div>
          )}

          {/* Source Configuration */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Source Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Rotation Type */}
              <div>
                <label htmlFor="rotationType" className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Assignment Rotation
                </label>
                <select
                  id="rotationType"
                  name="rotationType"
                  value={formData.rotationType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="round_robin">Round Robin (Fair Distribution)</option>
                  <option value="random">Random Assignment</option>
                  <option value="manual">Manual Assignment Only</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  How leads from this source will be assigned to agents
                </p>
              </div>

              {/* Priority */}
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <input
                  type="number"
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className={`w-full px-4 py-2 border rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.priority ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.priority && (
                  <p className="mt-1 text-sm text-red-600">{errors.priority}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Higher priority sources are processed first (1-10)
                </p>
              </div>
            </div>
          </div>

          {/* Source Settings */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Source Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active Source
                </label>
              </div>
              <p className="ml-6 text-sm text-gray-500">
                Inactive sources will not receive new leads
              </p>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="runAllTime"
                  name="runAllTime"
                  checked={formData.runAllTime}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="runAllTime" className="ml-2 block text-sm text-gray-900">
                  24/7 Operations
                </label>
              </div>
              <p className="ml-6 text-sm text-gray-500">
                Enable for international sources that operate outside office hours
              </p>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isCroned"
                  name="isCroned"
                  checked={formData.isCroned}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="isCroned" className="ml-2 block text-sm text-gray-900">
                  Automated Lead Distribution
                </label>
              </div>
              <p className="ml-6 text-sm text-gray-500">
                Automatically distribute leads from this source using the scheduler
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-gray-200 flex justify-end space-x-3">
            <Link href="/sources">
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={saving}
              leftIcon={saving ? undefined : <CheckIcon className="w-4 h-4" />}
            >
              {saving ? 'Saving...' : isEditMode ? 'Update Source' : 'Create Source'}
            </Button>
          </div>
        </form>
      </Card>
    </DashboardLayout>
  );
}
