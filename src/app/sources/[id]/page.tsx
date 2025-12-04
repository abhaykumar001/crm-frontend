'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { sourceApi, usersApi } from '@/lib/api';
import { Button, Card, Badge, Modal } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import {
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  UserPlusIcon,
  XMarkIcon,
  GlobeAltIcon,
  ClockIcon,
  ArrowPathIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

interface Source {
  id: number;
  name: string;
  type?: string;
  campaignId?: number;
  isActive: boolean;
  runAllTime: boolean;
  isCroned: boolean;
  rotationType?: string;
  priority?: number;
  createdAt: string;
  updatedAt: string;
  campaign?: {
    id: number;
    name: string;
    isInternational: boolean;
  };
}

interface SourceAgent {
  userId: number;
  sourceId: number;
  nextLeadAssign: boolean;
  user: {
    id: number;
    name: string;
    email: string;
    availability?: string;
    isExcluded?: boolean;
  };
}

interface SubSource {
  id: number;
  name: string;
  sourceId: number;
  isActive: boolean;
}

export default function SourceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const sourceId = parseInt(params.id as string);

  const [source, setSource] = useState<Source | null>(null);
  const [agents, setAgents] = useState<SourceAgent[]>([]);
  const [subSources, setSubSources] = useState<SubSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [showAddAgentModal, setShowAddAgentModal] = useState(false);
  const [showAddSubSourceModal, setShowAddSubSourceModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [subSourceName, setSubSourceName] = useState('');

  useEffect(() => {
    loadSourceDetails();
  }, [sourceId]);

  const loadSourceDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sourceRes, agentsRes, subSourcesRes] = await Promise.all([
        sourceApi.getSourceById(sourceId),
        sourceApi.getSourceAgents(sourceId),
        sourceApi.getSubSources(sourceId),
      ]);

      if (sourceRes.success) {
        setSource(sourceRes.data);
      } else {
        throw new Error(sourceRes.message || 'Failed to load source');
      }

      if (agentsRes.success) {
        setAgents(agentsRes.data || []);
      }

      if (subSourcesRes.success) {
        setSubSources(subSourcesRes.data || []);
      }
    } catch (err: any) {
      console.error('Error loading source:', err);
      setError(err.message || 'Failed to load source details');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableUsers = async () => {
    try {
      const response = await usersApi.getUsers({ role: 'agent' });
      if (response.success) {
        const agentUserIds = agents.map(a => a.userId);
        const available = (response.data || []).filter(
          (user: any) => !agentUserIds.includes(user.id) && user.isActive
        );
        setAvailableUsers(available);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const handleAddAgent = async () => {
    if (!selectedUserId) return;

    try {
      const response = await sourceApi.addAgentToSource(
        sourceId,
        parseInt(selectedUserId)
      );

      if (response.success) {
        setShowAddAgentModal(false);
        setSelectedUserId('');
        loadSourceDetails();
      } else {
        alert(response.message || 'Failed to add agent');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add agent');
    }
  };

  const handleRemoveAgent = async (userId: number, userName: string) => {
    if (!confirm(`Remove ${userName} from agent pool?`)) return;

    try {
      const response = await sourceApi.removeAgentFromSource(sourceId, userId);
      
      if (response.success) {
        loadSourceDetails();
      } else {
        alert(response.message || 'Failed to remove agent');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to remove agent');
    }
  };

  const handleAddSubSource = async () => {
    if (!subSourceName.trim()) return;

    try {
      const response = await sourceApi.createSubSource(sourceId, {
        name: subSourceName.trim(),
        isActive: true,
      });

      if (response.success) {
        setShowAddSubSourceModal(false);
        setSubSourceName('');
        loadSourceDetails();
      } else {
        alert(response.message || 'Failed to add sub-source');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to add sub-source');
    }
  };

  const handleToggleSubSource = async (subSource: SubSource) => {
    try {
      const response = await sourceApi.updateSubSource(
        sourceId,
        subSource.id,
        { isActive: !subSource.isActive }
      );

      if (response.success) {
        loadSourceDetails();
      } else {
        alert(response.message || 'Failed to update sub-source');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update sub-source');
    }
  };

  const handleDeleteSubSource = async (subSource: SubSource) => {
    if (!confirm(`Delete sub-source "${subSource.name}"?`)) return;

    try {
      const response = await sourceApi.deleteSubSource(sourceId, subSource.id);

      if (response.success) {
        loadSourceDetails();
      } else {
        alert(response.message || 'Failed to delete sub-source');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete sub-source');
    }
  };

  const handleDelete = async () => {
    if (!source) return;
    if (!confirm(`Are you sure you want to delete source "${source.name}"?`)) return;

    try {
      const response = await sourceApi.deleteSource(sourceId);
      if (response.success) {
        router.push('/sources');
      } else {
        alert(response.message || 'Failed to delete source');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete source');
    }
  };

  const getNextAgentToAssign = () => {
    const nextAgent = agents.find(a => a.nextLeadAssign);
    return nextAgent || agents[0];
  };

  if (loading) {
    return (
      <DashboardLayout title="Source Details" subtitle="Loading...">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p className="mt-2 text-gray-600">Loading source details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !source) {
    return (
      <DashboardLayout title="Source Details" subtitle="Error">
        <Card className="border-red-200 bg-red-50">
          <div className="flex items-center space-x-2 text-red-800">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error || 'Source not found'}</span>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  const nextAgent = getNextAgentToAssign();

  return (
    <DashboardLayout
      title={source.name}
      subtitle="Source Details & Agent Pool Management"
      actions={
        <div className="flex items-center space-x-3">
          <Link href="/sources">
            <Button variant="secondary" leftIcon={<ArrowLeftIcon className="w-4 h-4" />}>
              Back
            </Button>
          </Link>
          <Link href={`/sources/${source.id}/edit`}>
            <Button variant="secondary" leftIcon={<PencilIcon className="w-4 h-4" />}>
              Edit
            </Button>
          </Link>
          <Button
            variant="danger"
            leftIcon={<TrashIcon className="w-4 h-4" />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Source Info */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Source Information</h2>
              <div className="flex items-center space-x-2">
                <Badge variant={source.isActive ? 'success' : 'secondary'}>
                  {source.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge variant={source.type === 'Campaign' ? 'primary' : 'secondary'}>
                  {source.type || 'Normal'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {source.campaign && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Campaign
                    </label>
                    <div className="flex items-center">
                      {source.campaign.isInternational && (
                        <GlobeAltIcon className="w-4 h-4 mr-1 text-blue-600" />
                      )}
                      <Link href={`/campaigns/${source.campaign.id}`}>
                        <span className="text-primary-600 hover:underline">
                          {source.campaign.name}
                        </span>
                      </Link>
                    </div>
                  </div>
                )}

                {source.rotationType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Rotation Type
                    </label>
                    <p className="text-gray-900 capitalize flex items-center">
                      <ArrowPathIcon className="w-4 h-4 mr-1" />
                      {source.rotationType.replace('_', ' ')}
                    </p>
                  </div>
                )}

                {source.priority !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Priority
                    </label>
                    <p className="text-gray-900">{source.priority}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Settings
                  </label>
                  <div className="space-y-1">
                    {source.runAllTime && (
                      <Badge variant="info" size="sm">
                        <ClockIcon className="w-3 h-3 mr-1 inline" />
                        24/7 Operations
                      </Badge>
                    )}
                    {source.isCroned && (
                      <Badge variant="success" size="sm">
                        Auto-Distribution
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Created
                  </label>
                  <p className="text-gray-900">{formatDate(source.createdAt)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Agent Pool */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Agent Pool</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {agents.length} agent{agents.length !== 1 ? 's' : ''} in pool
                </p>
              </div>
              <Button
                size="sm"
                leftIcon={<UserPlusIcon className="w-4 h-4" />}
                onClick={() => {
                  loadAvailableUsers();
                  setShowAddAgentModal(true);
                }}
              >
                Add Agent
              </Button>
            </div>

            {source.rotationType === 'round_robin' && nextAgent && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900">Next Lead Assignment</p>
                    <p className="text-lg font-semibold text-blue-700">{nextAgent.user.name}</p>
                  </div>
                  <ArrowPathIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            )}

            {agents.length === 0 ? (
              <p className="text-gray-500 text-sm">No agents assigned to this source</p>
            ) : (
              <div className="space-y-2">
                {agents.map((agent, index) => (
                  <div
                    key={agent.userId}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      agent.nextLeadAssign
                        ? 'bg-blue-50 border-2 border-blue-300'
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-700">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="font-medium text-gray-900">{agent.user.name}</div>
                          {agent.nextLeadAssign && (
                            <Badge variant="primary" size="sm">Next</Badge>
                          )}
                          {agent.user.isExcluded && (
                            <Badge variant="warning" size="sm">Excluded</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">{agent.user.email}</div>
                        {agent.user.availability && (
                          <Badge
                            variant={
                              agent.user.availability === 'Available' ? 'success' :
                              agent.user.availability === 'Busy' ? 'warning' : 'secondary'
                            }
                            size="sm"
                          >
                            {agent.user.availability}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAgent(agent.userId, agent.user.name)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Sub-Sources */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Sub-Sources</h2>
              <Button
                size="sm"
                variant="secondary"
                leftIcon={<PlusIcon className="w-4 h-4" />}
                onClick={() => setShowAddSubSourceModal(true)}
              >
                Add
              </Button>
            </div>

            {subSources.length === 0 ? (
              <p className="text-gray-500 text-sm">No sub-sources created yet</p>
            ) : (
              <div className="space-y-2">
                {subSources.map((subSource) => (
                  <div
                    key={subSource.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{subSource.name}</span>
                      <Badge variant={subSource.isActive ? 'success' : 'secondary'} size="sm">
                        {subSource.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleSubSource(subSource)}
                        className="text-gray-600 hover:text-gray-800"
                        title={subSource.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {subSource.isActive ? '⏸' : '▶'}
                      </button>
                      <button
                        onClick={() => handleDeleteSubSource(subSource)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Add Agent Modal */}
      {showAddAgentModal && (
        <Modal
          isOpen={showAddAgentModal}
          onClose={() => setShowAddAgentModal(false)}
          title="Add Agent to Pool"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Agent
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select an agent...</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowAddAgentModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddAgent}
                disabled={!selectedUserId}
                className="flex-1"
              >
                Add Agent
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Sub-Source Modal */}
      {showAddSubSourceModal && (
        <Modal
          isOpen={showAddSubSourceModal}
          onClose={() => setShowAddSubSourceModal(false)}
          title="Add Sub-Source"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub-Source Name
              </label>
              <input
                type="text"
                value={subSourceName}
                onChange={(e) => setSubSourceName(e.target.value)}
                placeholder="e.g., Facebook Ad Set 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => setShowAddSubSourceModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddSubSource}
                disabled={!subSourceName.trim()}
                className="flex-1"
              >
                Add Sub-Source
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
}
