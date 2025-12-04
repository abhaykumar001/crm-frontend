'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { automationApi } from '@/lib/api';
import {
  Cog6ToothIcon,
  ClockIcon,
  BoltIcon,
  BellIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CheckIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface Setting {
  key: string;
  value: string;
  type: string;
  category: string;
  description: string;
}

interface SettingsGroup {
  automation: Record<string, any>;
  officeHours: Record<string, any>;
  leadAssignment: Record<string, any>;
}

type TabId = 'general' | 'hours' | 'assignment' | 'rotation' | 'reminders' | 'reports';

interface Tab {
  id: TabId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

export default function AutomationSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [settings, setSettings] = useState<SettingsGroup>({
    automation: {},
    officeHours: {},
    leadAssignment: {}
  });
  const [originalSettings, setOriginalSettings] = useState<SettingsGroup>({
    automation: {},
    officeHours: {},
    leadAssignment: {}
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const tabs: Tab[] = [
    { id: 'general', name: 'General', icon: Cog6ToothIcon },
    { id: 'hours', name: 'Office Hours', icon: ClockIcon },
    { id: 'assignment', name: 'Lead Assignment', icon: BoltIcon },
    { id: 'rotation', name: 'Rotation Rules', icon: ArrowPathIcon },
    { id: 'reminders', name: 'Reminders', icon: BellIcon },
    { id: 'reports', name: 'Reports', icon: DocumentTextIcon }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    // Check if settings have changed
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await automationApi.getSettings();
      
      if (response.success) {
        setSettings(response.data);
        setOriginalSettings(JSON.parse(JSON.stringify(response.data)));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);

      // Prepare updates for changed settings
      const updates = [];
      
      // Compare and collect all changed settings
      for (const category of Object.keys(settings) as Array<keyof SettingsGroup>) {
        const categorySettings = settings[category];
        const originalCategorySettings = originalSettings[category];
        
        for (const key of Object.keys(categorySettings)) {
          if (categorySettings[key] !== originalCategorySettings[key]) {
            const type = typeof categorySettings[key] === 'boolean' ? 'boolean' :
                        typeof categorySettings[key] === 'number' ? 'integer' : 'string';
            
            updates.push({
              key,
              value: categorySettings[key],
              type
            });
          }
        }
      }

      // Save each changed setting
      for (const update of updates) {
        await automationApi.updateSetting(update.key, {
          value: update.value,
          type: update.type
        });
      }

      // Reload settings to get fresh data
      await loadSettings();
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all changes?')) {
      setSettings(JSON.parse(JSON.stringify(originalSettings)));
    }
  };

  const updateSetting = (category: keyof SettingsGroup, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <DashboardLayout title="Automation Settings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Automation Settings"
      actions={
        <div className="flex items-center space-x-3">
          <Link href="/automation">
            <Button
              variant="outline"
              leftIcon={<ChartBarIcon className="h-4 w-4" />}
            >
              Dashboard
            </Button>
          </Link>
          <Link href="/automation/logs">
            <Button
              variant="outline"
              leftIcon={<DocumentTextIcon className="h-4 w-4" />}
            >
              Activity Logs
            </Button>
          </Link>
          {hasChanges && (
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saving}
            >
              Reset Changes
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            leftIcon={saveSuccess ? <CheckIcon className="h-4 w-4" /> : undefined}
          >
            {saving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Settings'}
          </Button>
        </div>
      }
    >
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                `} />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <GeneralSettings
          settings={settings.automation}
          onUpdate={(key, value) => updateSetting('automation', key, value)}
        />
      )}

      {activeTab === 'hours' && (
        <OfficeHoursSettings
          settings={settings.officeHours}
          onUpdate={(key, value) => updateSetting('officeHours', key, value)}
        />
      )}

      {activeTab === 'assignment' && (
        <LeadAssignmentSettings
          settings={settings.leadAssignment}
          onUpdate={(key, value) => updateSetting('leadAssignment', key, value)}
        />
      )}

      {activeTab === 'rotation' && (
        <RotationSettings
          settings={settings.automation}
          onUpdate={(key, value) => updateSetting('automation', key, value)}
        />
      )}

      {activeTab === 'reminders' && (
        <ReminderSettings
          settings={settings.automation}
          onUpdate={(key, value) => updateSetting('automation', key, value)}
        />
      )}

      {activeTab === 'reports' && (
        <ReportSettings
          settings={settings.automation}
          onUpdate={(key, value) => updateSetting('automation', key, value)}
        />
      )}

      {/* Save Warning */}
      {hasChanges && (
        <div className="fixed bottom-8 right-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg max-w-sm">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Unsaved Changes
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                You have unsaved changes. Don't forget to save!
              </p>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

// General Settings Component
function GeneralSettings({ settings, onUpdate }: { settings: Record<string, any>; onUpdate: (key: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <Card title="Automation Control" subtitle="Master switches for automation jobs">
        <div className="space-y-4">
          <ToggleSetting
            label="Enable Auto Lead Distribution"
            description="Automatically distribute leads from queue to available agents every 15 minutes"
            value={settings.autoLeaddistribution ?? true}
            onChange={(val) => onUpdate('autoLeaddistribution', val)}
          />
          
          <ToggleSetting
            label="Enable No Activity Lead Rotation"
            description="Reassign leads when agents don't act within configured time"
            value={settings.noActivityOnLeadRotation ?? true}
            onChange={(val) => onUpdate('noActivityOnLeadRotation', val)}
          />

          <ToggleSetting
            label="Enable Call Reminders"
            description="Send reminders 5 minutes before scheduled callbacks"
            value={settings.enableCallReminders ?? true}
            onChange={(val) => onUpdate('enableCallReminders', val)}
          />

          <ToggleSetting
            label="Enable Meeting Reminders"
            description="Send reminders 30 minutes before scheduled meetings"
            value={settings.enableMeetingReminders ?? true}
            onChange={(val) => onUpdate('enableMeetingReminders', val)}
          />
        </div>
      </Card>

      <Card title="Queue Configuration" subtitle="Lead queue and distribution settings">
        <div className="space-y-4">
          <NumberInput
            label="Queue User ID"
            description="User ID for lead queue (default: 821)"
            value={settings.queue_user_id ?? 821}
            onChange={(val) => onUpdate('queue_user_id', val)}
            min={1}
          />

          <NumberInput
            label="Fallback Admin ID"
            description="Admin user ID for escalated leads (default: 1)"
            value={settings.fallback_admin_id ?? 1}
            onChange={(val) => onUpdate('fallback_admin_id', val)}
            min={1}
          />
        </div>
      </Card>
    </div>
  );
}

// Office Hours Settings Component
function OfficeHoursSettings({ settings, onUpdate }: { settings: Record<string, any>; onUpdate: (key: string, value: any) => void }) {
  return (
    <Card title="Working Hours" subtitle="Configure office hours for automation">
      <div className="space-y-4">
        <TimeInput
          label="Working Hours Start"
          description="Start time for office hours (24-hour format)"
          value={settings.standard_working_from_time || '09:00'}
          onChange={(val) => onUpdate('standard_working_from_time', val)}
        />

        <TimeInput
          label="Working Hours End"
          description="End time for office hours (24-hour format)"
          value={settings.standard_working_to_time || '18:00'}
          onChange={(val) => onUpdate('standard_working_to_time', val)}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Working Days
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Select which days of the week are working days
          </p>
          <div className="flex flex-wrap gap-2">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => {
              const workingDays = settings.working_days ? settings.working_days.split(',').map(Number) : [1, 2, 3, 4, 5];
              const isSelected = workingDays.includes(index);
              
              return (
                <button
                  key={day}
                  onClick={() => {
                    const days = settings.working_days ? settings.working_days.split(',').map(Number) : [1, 2, 3, 4, 5];
                    if (days.includes(index)) {
                      onUpdate('working_days', days.filter((d: number) => d !== index).join(','));
                    } else {
                      onUpdate('working_days', [...days, index].sort().join(','));
                    }
                  }}
                  className={`
                    px-4 py-2 rounded-lg border text-sm font-medium transition-colors
                    ${isSelected
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Lead Assignment Settings Component
function LeadAssignmentSettings({ settings, onUpdate }: { settings: Record<string, any>; onUpdate: (key: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <Card title="Distribution Rules" subtitle="How leads are distributed to agents">
        <div className="space-y-4">
          <NumberInput
            label="Max Leads Per Agent"
            description="Maximum number of active leads per agent"
            value={settings.max_leads_per_agent ?? 50}
            onChange={(val) => onUpdate('max_leads_per_agent', val)}
            min={1}
            max={200}
          />

          <NumberInput
            label="Fresh Lead Priority"
            description="Priority score for fresh leads (higher = more priority)"
            value={settings.fresh_lead_priority ?? 10}
            onChange={(val) => onUpdate('fresh_lead_priority', val)}
            min={1}
            max={20}
          />
        </div>
      </Card>

      <Card title="Assignment Limits" subtitle="Control assignment attempt limits">
        <div className="space-y-4">
          <NumberInput
            label="Max Assignment Attempts"
            description="Maximum times a lead can be reassigned"
            value={settings.max_assignment_attempts ?? 5}
            onChange={(val) => onUpdate('max_assignment_attempts', val)}
            min={1}
            max={10}
          />

          <NumberInput
            label="Fresh Lead Threshold"
            description="Number of assignments before marking lead as non-fresh"
            value={settings.fresh_lead_threshold ?? 2}
            onChange={(val) => onUpdate('fresh_lead_threshold', val)}
            min={1}
            max={5}
          />
        </div>
      </Card>
    </div>
  );
}

// Rotation Settings Component
function RotationSettings({ settings, onUpdate }: { settings: Record<string, any>; onUpdate: (key: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <Card title="No Activity Rotation" subtitle="Settings for inactive lead rotation">
        <div className="space-y-4">
          <ToggleSetting
            label="Enable No Activity Rotation"
            description="Automatically reassign leads with no agent activity"
            value={settings.noActivityOnLeadRotation ?? true}
            onChange={(val) => onUpdate('noActivityOnLeadRotation', val)}
          />

          <NumberInput
            label="No Activity Timeout (minutes)"
            description="Time before reassigning inactive leads"
            value={settings.noActivityTimeDuration ?? 30}
            onChange={(val) => onUpdate('noActivityTimeDuration', val)}
            min={15}
            max={1440}
            step={15}
          />
        </div>
      </Card>

      <Card title="Status-Based Rotation" subtitle="Rotation rules for specific lead statuses">
        <div className="space-y-4">
          <ToggleSetting
            label="Enable No Answer Rotation"
            description="Reassign leads in 'No Answer' status every 4 hours"
            value={settings.enableNoAnswerRotation ?? true}
            onChange={(val) => onUpdate('enableNoAnswerRotation', val)}
          />

          <ToggleSetting
            label="Enable Not Interested Rotation"
            description="Give 'Not Interested' leads 3 chances with different agents"
            value={settings.enableNotInterestedRotation ?? true}
            onChange={(val) => onUpdate('enableNotInterestedRotation', val)}
          />

          <NumberInput
            label="Max Not Interested Attempts"
            description="Maximum assignment attempts for 'Not Interested' leads"
            value={settings.maxNotInterestedAttempts ?? 3}
            onChange={(val) => onUpdate('maxNotInterestedAttempts', val)}
            min={1}
            max={5}
          />
        </div>
      </Card>
    </div>
  );
}

// Reminder Settings Component
function ReminderSettings({ settings, onUpdate }: { settings: Record<string, any>; onUpdate: (key: string, value: any) => void }) {
  return (
    <div className="space-y-6">
      <Card title="Call Reminders" subtitle="Callback reminder configuration">
        <div className="space-y-4">
          <ToggleSetting
            label="Enable Call Reminders"
            description="Send reminders before scheduled callbacks"
            value={settings.enableCallReminders ?? true}
            onChange={(val) => onUpdate('enableCallReminders', val)}
          />

          <NumberInput
            label="Call Reminder Time (minutes)"
            description="How many minutes before callback to send reminder"
            value={settings.callReminderMinutes ?? 5}
            onChange={(val) => onUpdate('callReminderMinutes', val)}
            min={1}
            max={60}
          />
        </div>
      </Card>

      <Card title="Meeting Reminders" subtitle="Meeting reminder configuration">
        <div className="space-y-4">
          <ToggleSetting
            label="Enable Meeting Reminders"
            description="Send reminders before scheduled meetings"
            value={settings.enableMeetingReminders ?? true}
            onChange={(val) => onUpdate('enableMeetingReminders', val)}
          />

          <NumberInput
            label="Meeting Reminder Time (minutes)"
            description="How many minutes before meeting to send reminder"
            value={settings.meetingReminderMinutes ?? 30}
            onChange={(val) => onUpdate('meetingReminderMinutes', val)}
            min={5}
            max={120}
            step={5}
          />
        </div>
      </Card>
    </div>
  );
}

// Report Settings Component
function ReportSettings({ settings, onUpdate }: { settings: Record<string, any>; onUpdate: (key: string, value: any) => void }) {
  return (
    <Card title="Daily Email Reports" subtitle="Configure automated reporting">
      <div className="space-y-4">
        <ToggleSetting
          label="Enable Daily Reports"
          description="Send daily lead status reports to managers"
          value={settings.enableDailyReports ?? true}
          onChange={(val) => onUpdate('enableDailyReports', val)}
        />

        <TimeInput
          label="Report Send Time"
          description="Time to send daily reports (24-hour format)"
          value={settings.dailyReportTime || '08:00'}
          onChange={(val) => onUpdate('dailyReportTime', val)}
        />

        <ToggleSetting
          label="Include Team Metrics"
          description="Include team performance metrics in reports"
          value={settings.includeTeamMetrics ?? true}
          onChange={(val) => onUpdate('includeTeamMetrics', val)}
        />
      </div>
    </Card>
  );
}

// Reusable Input Components
function ToggleSetting({ label, description, value, onChange }: {
  label: string;
  description: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between py-3">
      <div className="flex-1">
        <label className="block text-sm font-medium text-gray-900">
          {label}
        </label>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${value ? 'bg-blue-600' : 'bg-gray-200'}
        `}
      >
        <span
          className={`
            inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
            ${value ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}

function NumberInput({ label, description, value, onChange, min, max, step }: {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="py-3">
      <label className="block text-sm font-medium text-gray-900 mb-1">
        {label}
      </label>
      <p className="text-sm text-gray-500 mb-2">{description}</p>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        min={min}
        max={max}
        step={step || 1}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}

function TimeInput({ label, description, value, onChange }: {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="py-3">
      <label className="block text-sm font-medium text-gray-900 mb-1">
        {label}
      </label>
      <p className="text-sm text-gray-500 mb-2">{description}</p>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
}
