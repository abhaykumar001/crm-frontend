'use client';

import React, { useState, useEffect } from 'react';
import { Input, Select, Button } from '@/components/ui';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface DealFormProps {
  dealId?: string;
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DealForm: React.FC<DealFormProps> = ({ 
  dealId, 
  initialData, 
  onSuccess, 
  onCancel 
}) => {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    // Basic Information
    title: initialData?.title || '',
    projectId: initialData?.projectId || '',
    leadId: initialData?.leadId || '',
    assignedAgentId: initialData?.assignedAgentId || '',
    status: initialData?.status || 'pending',
    
    // Financial Details
    dealValue: initialData?.dealValue || '',
    commissionRate: initialData?.commissionRate || '',
    commissionAmount: initialData?.commissionAmount || '',
    
    // Property Details
    unitNumber: initialData?.unitNumber || '',
    floorNumber: initialData?.floorNumber || '',
    carpetArea: initialData?.carpetArea || '',
    
    // Dates
    closingDate: initialData?.closingDate || '',
    expectedClosingDate: initialData?.expectedClosingDate || '',
    
    // Additional
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    // Auto-calculate commission amount
    if (formData.dealValue && formData.commissionRate) {
      const dealValue = parseFloat(formData.dealValue);
      const rate = parseFloat(formData.commissionRate);
      if (!isNaN(dealValue) && !isNaN(rate)) {
        const commission = (dealValue * rate) / 100;
        setFormData(prev => ({ ...prev, commissionAmount: commission.toString() }));
      }
    }
  }, [formData.dealValue, formData.commissionRate]);

  const loadFormData = async () => {
    try {
      // Load projects
      const projectsResponse = await api.get('/projects');
      setProjects(projectsResponse.data.projects || projectsResponse.data || []);
    } catch (error) {
      // Use mock data as fallback
      setProjects([
        { id: '1', name: 'Luxury Apartments' },
        { id: '2', name: 'Business Park' },
        { id: '3', name: 'Residential Complex' },
      ]);
    }

    try {
      // Load leads
      const leadsResponse = await api.get('/leads');
      setLeads(leadsResponse.data.leads || leadsResponse.data || []);
    } catch (error) {
      setLeads([
        { id: '1', firstName: 'John', lastName: 'Doe' },
        { id: '2', firstName: 'Jane', lastName: 'Smith' },
      ]);
    }

    try {
      // Load agents
      const agentsResponse = await api.get('/users/agents');
      setAgents(agentsResponse.data.agents || agentsResponse.data || []);
    } catch (error) {
      setAgents([
        { id: '1', firstName: 'Agent', lastName: 'One' },
        { id: '2', firstName: 'Agent', lastName: 'Two' },
      ]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.projectId) {
      newErrors.projectId = 'Project is required';
    }
    if (!formData.leadId) {
      newErrors.leadId = 'Lead is required';
    }
    if (!formData.assignedAgentId) {
      newErrors.assignedAgentId = 'Agent is required';
    }
    if (!formData.dealValue || parseFloat(formData.dealValue) <= 0) {
      newErrors.dealValue = 'Valid deal value is required';
    }
    if (!formData.commissionRate || parseFloat(formData.commissionRate) < 0 || parseFloat(formData.commissionRate) > 100) {
      newErrors.commissionRate = 'Commission rate must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        dealValue: parseFloat(formData.dealValue),
        commissionRate: parseFloat(formData.commissionRate),
        commissionAmount: parseFloat(formData.commissionAmount),
        carpetArea: formData.carpetArea ? parseFloat(formData.carpetArea) : null,
        floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : null,
        closingDate: formData.closingDate || null,
        expectedClosingDate: formData.expectedClosingDate || null,
      };

      if (dealId) {
        await api.put(`/deals/${dealId}`, payload);
        toast.success('Deal updated successfully!');
      } else {
        await api.post('/deals', payload);
        toast.success('Deal created successfully!');
      }
      
      onSuccess?.();
    } catch (error: any) {
      console.error('Error saving deal:', error);
      toast.error(error.response?.data?.message || 'Failed to save deal');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'negotiation', label: 'Negotiation' },
    { value: 'contract_sent', label: 'Contract Sent' },
    { value: 'contract_signed', label: 'Contract Signed' },
    { value: 'payment_pending', label: 'Payment Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Deal Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="e.g., Apartment Sale - Unit 501"
            required
          />

          <Select
            label="Project"
            name="projectId"
            value={formData.projectId}
            onChange={handleChange}
            error={errors.projectId}
            required
            options={[
              { value: '', label: 'Select Project' },
              ...projects.map(p => ({ value: p.id, label: p.name }))
            ]}
          />

          <Select
            label="Lead"
            name="leadId"
            value={formData.leadId}
            onChange={handleChange}
            error={errors.leadId}
            required
            options={[
              { value: '', label: 'Select Lead' },
              ...leads.map(l => ({ value: l.id, label: `${l.firstName} ${l.lastName}` }))
            ]}
          />

          <Select
            label="Assigned Agent"
            name="assignedAgentId"
            value={formData.assignedAgentId}
            onChange={handleChange}
            error={errors.assignedAgentId}
            required
            options={[
              { value: '', label: 'Select Agent' },
              ...agents.map(a => ({ value: a.id, label: `${a.firstName} ${a.lastName}` }))
            ]}
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
          />
        </div>
      </div>

      {/* Financial Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Financial Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Deal Value (₹)"
            name="dealValue"
            type="number"
            step="0.01"
            value={formData.dealValue}
            onChange={handleChange}
            error={errors.dealValue}
            placeholder="5000000"
            required
          />

          <Input
            label="Commission Rate (%)"
            name="commissionRate"
            type="number"
            step="0.01"
            value={formData.commissionRate}
            onChange={handleChange}
            error={errors.commissionRate}
            placeholder="2.5"
            required
          />

          <Input
            label="Commission Amount (₹)"
            name="commissionAmount"
            type="number"
            step="0.01"
            value={formData.commissionAmount}
            onChange={handleChange}
            placeholder="Auto-calculated"
            disabled
            helperText="Auto-calculated from deal value and rate"
          />
        </div>
      </div>

      {/* Property Details */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Property Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Unit Number"
            name="unitNumber"
            value={formData.unitNumber}
            onChange={handleChange}
            placeholder="501"
          />

          <Input
            label="Floor Number"
            name="floorNumber"
            type="number"
            value={formData.floorNumber}
            onChange={handleChange}
            placeholder="5"
          />

          <Input
            label="Carpet Area (sq ft)"
            name="carpetArea"
            type="number"
            step="0.01"
            value={formData.carpetArea}
            onChange={handleChange}
            placeholder="1200"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Timeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Expected Closing Date"
            name="expectedClosingDate"
            type="date"
            value={formData.expectedClosingDate}
            onChange={handleChange}
          />

          <Input
            label="Actual Closing Date"
            name="closingDate"
            type="date"
            value={formData.closingDate}
            onChange={handleChange}
            helperText="Leave empty if not yet closed"
          />
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Additional Notes</h3>
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Any additional information about the deal..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          isLoading={loading}
        >
          {dealId ? 'Update Deal' : 'Create Deal'}
        </Button>
      </div>
    </form>
  );
};

export default DealForm;
