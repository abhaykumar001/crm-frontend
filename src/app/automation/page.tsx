'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  PlayIcon,
  StopIcon,
  BoltIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { automationApi } from '@/lib/api';

interface JobStatus {
  name: string;
  schedule: string;
  lastExecution: string | null;
  nextExecution: string | null;
  status: 'idle' | 'running' | 'success' | 'error';
}

interface SchedulerStatus {
  isRunning: boolean;
  registeredJobs: string[];
  jobSchedules: Record<string, string>;
  lastExecutions: Record<string, string>;
}

interface ActivityStats {
  totalEvents: number;
  byType: Record<string, number>;
  startDate: string;
  endDate: string;
}

interface ActivityLog {
  id: number;
  eventType: string;
  description: string;
  subjectType: string | null;
  subjectId: number | null;
  causerId: number | null;
  properties: any;
  createdAt: string;
}

export default function AutomationDashboard() {
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [recentLogs, setRecentLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const [healthRes, statsRes, logsRes] = await Promise.all([
        automationApi.getHealth(),
        automationApi.getStats(),
        automationApi.getActivityLogs({ limit: 10 }),
      ]);

      if (healthRes.success && statsRes.success && logsRes.success) {
        setSchedulerStatus({
          isRunning: healthRes.data.isRunning,
          registeredJobs: healthRes.data.jobs.map((j: any) => j.name),
          jobSchedules: healthRes.data.jobs.reduce((acc: any, j: any) => {
            acc[j.name] = j.schedule;
            return acc;
          }, {}),
          lastExecutions: healthRes.data.jobs.reduce((acc: any, j: any) => {
            acc[j.name] = j.lastRun;
            return acc;
          }, {}),
        });
        setActivityStats(statsRes.data);
        setRecentLogs(logsRes.data || []);
      } else {
        throw new Error('Failed to fetch automation data');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred');
      console.error('Error fetching automation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSchedulerAction = async (action: 'start' | 'stop') => {
    if (!schedulerStatus?.registeredJobs) return;
    
    try {
      setActionLoading(action);
      
      // Enable or disable all jobs
      const promises = schedulerStatus.registeredJobs.map((jobName) => {
        if (action === 'start') {
          return automationApi.enableJob(jobName);
        } else {
          return automationApi.disableJob(jobName);
        }
      });
      
      await Promise.all(promises);
      await fetchData();
    } catch (err: any) {
      setError(err?.message || 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const handleTriggerJob = async (jobName: string) => {
    try {
      setActionLoading(jobName);
      const result = await automationApi.triggerJob(jobName);
      
      if (result.success) {
        alert(`Job executed successfully!\n${result.message || 'Job triggered'}`);
        await fetchData();
      } else {
        throw new Error(result.message || 'Failed to trigger job');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const getJobDisplayName = (jobName: string) => {
    const names: Record<string, string> = {
      autoLeadDistribution: 'Auto Lead Distribution',
      noActivityLeadRotation: 'No Activity Lead Rotation',
    };
    return names[jobName] || jobName;
  };

  const getEventTypeColor = (eventType: string) => {
    const colors: Record<string, string> = {
      auto_distribution: 'text-blue-700 bg-blue-100',
      no_activity_rotation: 'text-purple-700 bg-purple-100',
      cron_started: 'text-green-700 bg-green-100',
      cron_completed: 'text-gray-700 bg-gray-100',
      cron_failed: 'text-red-700 bg-red-100',
    };
    return colors[eventType] || 'text-gray-700 bg-gray-100';
  };

  if (loading) {
    return (
      <DashboardLayout title="Automation">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Automation Dashboard"
      actions={
        <div className="flex items-center space-x-3">
          <Link href="/automation/logs">
            <Button
              variant="outline"
              leftIcon={<DocumentTextIcon className="h-5 w-5" />}
            >
              Activity Logs
            </Button>
          </Link>
          <Link href="/automation/settings">
            <Button
              variant="outline"
              leftIcon={<Cog6ToothIcon className="h-5 w-5" />}
            >
              Settings
            </Button>
          </Link>
          {schedulerStatus?.isRunning ? (
            <Button
              variant="danger"
              leftIcon={<StopIcon className="h-5 w-5" />}
              onClick={() => handleSchedulerAction('stop')}
              isLoading={actionLoading === 'stop'}
            >
              Stop Scheduler
            </Button>
          ) : (
            <Button
              variant="success"
              leftIcon={<PlayIcon className="h-5 w-5" />}
              onClick={() => handleSchedulerAction('start')}
              isLoading={actionLoading === 'start'}
            >
              Start Scheduler
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Scheduler Status Card */}
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              'p-3 rounded-lg',
              schedulerStatus?.isRunning ? 'bg-green-100' : 'bg-gray-100'
            )}>
              {schedulerStatus?.isRunning ? (
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              ) : (
                <XCircleIcon className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Scheduler Status</h3>
              <p className={cn(
                'text-sm font-medium',
                schedulerStatus?.isRunning ? 'text-green-600' : 'text-gray-500'
              )}>
                {schedulerStatus?.isRunning ? 'Running' : 'Stopped'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Registered Jobs</p>
            <p className="text-2xl font-bold text-gray-900">
              {schedulerStatus?.registeredJobs.length || 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BoltIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Events (7 Days)</p>
              <p className="text-2xl font-bold text-gray-900">
                {activityStats?.totalEvents || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ArrowPathIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Distributions</p>
              <p className="text-2xl font-bold text-gray-900">
                {activityStats?.byType?.auto_distribution || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <ClockIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Rotations</p>
              <p className="text-2xl font-bold text-gray-900">
                {activityStats?.byType?.no_activity_rotation || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Job Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {schedulerStatus?.registeredJobs.map((jobName) => (
          <Card key={jobName} title={getJobDisplayName(jobName)}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Schedule:</span>
                <span className="text-sm font-mono text-gray-900">
                  {schedulerStatus.jobSchedules[jobName] || 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Last Execution:</span>
                <span className="text-sm text-gray-900">
                  {formatDate(schedulerStatus.lastExecutions[jobName])}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                leftIcon={<PlayIcon className="h-4 w-4" />}
                onClick={() => handleTriggerJob(jobName)}
                isLoading={actionLoading === jobName}
                disabled={!schedulerStatus.isRunning}
              >
                Trigger Manually
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card 
        title="Recent Activity" 
        subtitle="Last 10 automation events"
        actions={
          <Link href="/automation/logs">
            <Button variant="outline" size="sm">
              View All Logs
            </Button>
          </Link>
        }
      >
        <div className="space-y-3">
          {recentLogs.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No activity logs yet</p>
          ) : (
            recentLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={cn(
                  'px-2 py-1 rounded text-xs font-medium whitespace-nowrap',
                  getEventTypeColor(log.eventType)
                )}>
                  {log.eventType.replace(/_/g, ' ').toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{log.description}</p>
                  {log.properties && (
                    <p className="text-xs text-gray-500 mt-1">
                      {JSON.stringify(log.properties)}
                    </p>
                  )}
                </div>
                <div className="text-xs text-gray-500 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
      </div>
    </DashboardLayout>
  );
}
