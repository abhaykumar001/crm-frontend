'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { analyticsApi } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyRupeeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  CalendarIcon,
  FunnelIcon,
  PresentationChartLineIcon,
  DocumentChartBarIcon,
} from '@heroicons/react/24/outline';

interface AnalyticsData {
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
  leads: {
    total: number;
    thisMonth: number;
    conversion: number;
    sources: Array<{ name: string; count: number; percentage: number }>;
  };
  deals: {
    total: number;
    won: number;
    pipeline: number;
    avgSize: number;
    stages: Array<{ name: string; count: number; value: number }>;
  };
  agents: {
    total: number;
    active: number;
    topPerformers: Array<{ name: string; deals: number; revenue: number }>;
  };
  communication: {
    calls: number;
    emails: number;
    meetings: number;
    followUps: number;
  };
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data since the analytics API might not return all this data
      const mockData: AnalyticsData = {
        revenue: {
          total: 12500000,
          thisMonth: 2500000,
          lastMonth: 2200000,
          growth: 13.6,
        },
        leads: {
          total: 1250,
          thisMonth: 320,
          conversion: 24.5,
          sources: [
            { name: 'Website', count: 450, percentage: 36 },
            { name: 'Referral', count: 350, percentage: 28 },
            { name: 'Social Media', count: 250, percentage: 20 },
            { name: 'Walk-in', count: 125, percentage: 10 },
            { name: 'Other', count: 75, percentage: 6 },
          ],
        },
        deals: {
          total: 485,
          won: 118,
          pipeline: 12500000,
          avgSize: 2580000,
          stages: [
            { name: 'Lead', count: 150, value: 4500000 },
            { name: 'Qualified', count: 120, value: 3600000 },
            { name: 'Proposal', count: 85, value: 2550000 },
            { name: 'Negotiation', count: 50, value: 1500000 },
            { name: 'Closed Won', count: 118, value: 3540000 },
            { name: 'Closed Lost', count: 62, value: 0 },
          ],
        },
        agents: {
          total: 15,
          active: 12,
          topPerformers: [
            { name: 'Sarah Wilson', deals: 24, revenue: 6200000 },
            { name: 'John Smith', deals: 18, revenue: 4800000 },
            { name: 'Emily Johnson', deals: 16, revenue: 4200000 },
            { name: 'Michael Brown', deals: 14, revenue: 3600000 },
            { name: 'Lisa Davis', deals: 12, revenue: 3100000 },
          ],
        },
        communication: {
          calls: 1580,
          emails: 2340,
          meetings: 420,
          followUps: 180,
        },
      };
      
      setAnalyticsData(mockData);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    if (growth < 0) return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <DashboardLayout title="Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Analytics">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadAnalytics}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Analytics"
      actions={
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-lg border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button
            onClick={loadAnalytics}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm text-sm font-medium transition-colors"
          >
            Refresh
          </button>
        </div>
      }
    >
      {analyticsData && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.revenue.total)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <CurrencyRupeeIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {getGrowthIcon(analyticsData.revenue.growth)}
                <span className={`text-sm ml-1 ${getGrowthColor(analyticsData.revenue.growth)}`}>
                  {analyticsData.revenue.growth > 0 ? '+' : ''}{analyticsData.revenue.growth}%
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Leads</p>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.leads.total)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-sm text-gray-600">
                  {analyticsData.leads.thisMonth} this month
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{analyticsData.leads.conversion}%</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <FunnelIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {getGrowthIcon(2.3)}
                <span className="text-sm text-green-600 ml-1">+2.3%</span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Avg Deal Size</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.deals.avgSize)}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <CurrencyRupeeIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                {getGrowthIcon(-1.2)}
                <span className="text-sm text-red-600 ml-1">-1.2%</span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Lead Sources */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Lead Sources</h3>
                <DocumentChartBarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {analyticsData.leads.sources.map((source, index) => (
                  <div key={source.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        index === 0 ? 'bg-blue-500' :
                        index === 1 ? 'bg-green-500' :
                        index === 2 ? 'bg-purple-500' :
                        index === 3 ? 'bg-orange-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900">{source.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{source.count}</div>
                      <div className="text-xs text-gray-500">{source.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deal Pipeline */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Deal Pipeline</h3>
                <FunnelIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {analyticsData.deals.stages.map((stage, index) => (
                  <div key={stage.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        stage.name === 'Closed Won' ? 'bg-green-500' :
                        stage.name === 'Closed Lost' ? 'bg-red-500' :
                        stage.name === 'Negotiation' ? 'bg-orange-500' :
                        stage.name === 'Proposal' ? 'bg-yellow-500' :
                        stage.name === 'Qualified' ? 'bg-blue-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900">{stage.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{stage.count} deals</div>
                      <div className="text-xs text-gray-500">{formatCurrency(stage.value)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Top Performing Agents */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Top Performing Agents</h3>
                <UserGroupIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                {analyticsData.agents.topPerformers.map((agent, index) => (
                  <div key={agent.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-gray-700">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{agent.name}</div>
                        <div className="text-xs text-gray-500">{agent.deals} deals closed</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-gray-900">{formatCurrency(agent.revenue)}</div>
                      <div className="text-xs text-gray-500">Revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Communication Stats */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Communication Activity</h3>
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <PhoneIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.communication.calls)}</div>
                  <div className="text-sm text-gray-500">Calls</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <BuildingOfficeIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.communication.emails)}</div>
                  <div className="text-sm text-gray-500">Emails</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <CalendarIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.communication.meetings)}</div>
                  <div className="text-sm text-gray-500">Meetings</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <CalendarIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.communication.followUps)}</div>
                  <div className="text-sm text-gray-500">Follow-ups</div>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <PresentationChartLineIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="h-64 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">Interactive Revenue Chart</p>
                <p className="text-sm text-gray-400 mt-2">Chart.js integration coming soon</p>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}