'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input, Select, Button } from '@/components/ui';
import { leadsApi, usersApi } from '@/lib/api';
import { LeadForm as LeadFormData } from '@/types';
import toast from 'react-hot-toast';

interface LeadFormProps {
  initialData?: Partial<LeadFormData> & { id?: number };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const LeadForm: React.FC<LeadFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  
  const [formData, setFormData] = useState<LeadFormData>({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    alternatePhone: initialData?.alternatePhone || '',
    source: initialData?.source || '',
    statusId: initialData?.statusId || 1,
    assignedToId: initialData?.assignedToId,
    budget: initialData?.budget,
    requirements: initialData?.requirements || '',
    notes: initialData?.notes || '',
    nextFollowUp: initialData?.nextFollowUp || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadFormData();
  }, []);

  const loadFormData = async () => {
    try {
      const [sourcesRes, statusesRes, usersRes] = await Promise.all([
        leadsApi.getLeadSources().catch(() => ({ success: false, data: [] })),
        leadsApi.getLeadStatuses().catch(() => ({ success: false, data: [] })),
        usersApi.getUsers({ role: 'agent' }).catch(() => ({ success: false, data: [] })),
      ]);

      if (sourcesRes.success && sourcesRes.data) {
        setSources(sourcesRes.data);
      } else {
        // Mock data
        setSources([
          { id: 1, name: 'Website' },
          { id: 2, name: 'Referral' },
          { id: 3, name: 'Social Media' },
          { id: 4, name: 'Walk-in' },
          { id: 5, name: 'Advertisement' },
        ]);
      }

      if (statusesRes.success && statusesRes.data) {
        setStatuses(statusesRes.data);
      } else {
        // Mock data
        setStatuses([
          { id: 1, name: 'New' },
          { id: 2, name: 'Contacted' },
          { id: 3, name: 'Qualified' },
          { id: 4, name: 'Interested' },
          { id: 5, name: 'Converted' },
          { id: 6, name: 'Lost' },
        ]);
      }

      if (usersRes.success && usersRes.data) {
        setAgents(usersRes.data);
      } else {
        // Mock data
        setAgents([
          { id: 1, name: 'Sarah Wilson' },
          { id: 2, name: 'John Doe' },
          { id: 3, name: 'Emily Chen' },
        ]);
      }
    } catch (error) {
      console.error('Error loading form data:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^[\d\s+()-]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone format';
    }

    if (!formData.source) {
      newErrors.source = 'Source is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof LeadFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const response = initialData?.id
        ? await leadsApi.updateLead(initialData.id, formData)
        : await leadsApi.createLead(formData);

      if (response.success) {
        toast.success(initialData?.id ? 'Lead updated successfully!' : 'Lead created successfully!');
        
        if (onSuccess) {
          onSuccess();
        } else {
          router.push('/leads');
        }
      } else {
        toast.error(response.message || 'Failed to save lead');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save lead');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={errors.name}
            required
            placeholder="Enter full name"
          />

          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
            required
            placeholder="email@example.com"
          />

          <Input
            label="Phone Number"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            required
            placeholder="+91 9876543210"
          />

          <Input
            label="Alternate Phone"
            value={formData.alternatePhone || ''}
            onChange={(e) => handleChange('alternatePhone', e.target.value)}
            placeholder="+91 9876543210"
          />
        </div>
      </div>

      {/* Lead Details */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Details</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Source"
            value={formData.source}
            onChange={(e) => handleChange('source', e.target.value)}
            error={errors.source}
            required
            options={sources.map(s => ({ value: s.name, label: s.name }))}
            placeholder="Select source"
          />

          <Select
            label="Status"
            value={formData.statusId}
            onChange={(e) => handleChange('statusId', parseInt(e.target.value))}
            required
            options={statuses.map(s => ({ value: s.id, label: s.name }))}
          />

          <Select
            label="Assign To"
            value={formData.assignedToId || ''}
            onChange={(e) => handleChange('assignedToId', e.target.value ? parseInt(e.target.value) : undefined)}
            options={[
              { value: '', label: 'Unassigned' },
              ...agents.map(a => ({ value: a.id, label: a.name }))
            ]}
          />

          <Input
            label="Budget"
            type="number"
            value={formData.budget || ''}
            onChange={(e) => handleChange('budget', e.target.value ? parseFloat(e.target.value) : undefined)}
            placeholder="Enter budget amount"
          />
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Requirements
            </label>
            <textarea
              value={formData.requirements || ''}
              onChange={(e) => handleChange('requirements', e.target.value)}
              rows={4}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Enter customer requirements..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={3}
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Add any additional notes..."
            />
          </div>

          <Input
            label="Next Follow-up Date"
            type="datetime-local"
            value={formData.nextFollowUp || ''}
            onChange={(e) => handleChange('nextFollowUp', e.target.value)}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex items-center justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else {
              router.back();
            }
          }}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          isLoading={loading}
        >
          {initialData?.id ? 'Update Lead' : 'Create Lead'}
        </Button>
      </div>
    </form>
  );
};

export default LeadForm;
