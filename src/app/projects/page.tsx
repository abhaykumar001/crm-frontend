'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DashboardLayout from '@/components/DashboardLayout';
import { projectsApi } from '@/lib/api';
import { Project } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  BuildingOfficeIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

interface ProjectFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  status?: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ProjectFilters>({
    page: 1,
    limit: 12,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    loadProjects();
  }, [filters]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      try {
        const response = await projectsApi.getProjects(filters);
        if (response.success) {
          setProjects(response.data || []);
          return;
        }
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError);
      }
      
      // Fallback to mock data if API fails
      const mockProjects: Project[] = [
        {
          id: 1,
          name: 'Phoenix Heights',
          location: 'Bandra West, Mumbai',
          status: 'under_construction',
          priceRange: '₹85L - ₹1.5Cr',
          developerId: 1,
          developer: { id: 1, name: 'Phoenix Developers', isActive: true },
          isActive: true,
          createdAt: '2023-10-01T00:00:00Z',
          updatedAt: '2023-10-01T00:00:00Z',
          amenities: [
            { id: 1, projectId: 1, name: 'Swimming Pool' },
            { id: 2, projectId: 1, name: 'Gym' },
            { id: 3, projectId: 1, name: 'Garden' },
            { id: 4, projectId: 1, name: 'Security' },
          ],
          media: [
            { id: 1, projectId: 1, type: 'image', fileName: 'project1.jpg', filePath: '/images/project1.jpg', fileSize: 0, mimeType: 'image/jpeg' }
          ],
        },
        {
          id: 2,
          name: 'Skyline Towers',
          location: 'Whitefield, Bangalore',
          status: 'planning',
          priceRange: '₹45L - ₹85L',
          developerId: 2,
          developer: { id: 2, name: 'Skyline Builders', isActive: true },
          isActive: true,
          createdAt: '2023-09-15T00:00:00Z',
          updatedAt: '2023-09-15T00:00:00Z',
          amenities: [
            { id: 1, projectId: 2, name: 'Swimming Pool' },
            { id: 5, projectId: 2, name: 'Club House' },
            { id: 6, projectId: 2, name: 'Playground' },
          ],
          media: [],
        },
        {
          id: 3,
          name: 'Golden Villas',
          location: 'Koregaon Park, Pune',
          status: 'under_construction',
          priceRange: '₹1.8Cr - ₹3.5Cr',
          developerId: 3,
          developer: { id: 3, name: 'Golden Estates', isActive: true },
          isActive: true,
          createdAt: '2023-08-01T00:00:00Z',
          updatedAt: '2023-08-01T00:00:00Z',
          amenities: [
            { id: 7, projectId: 3, name: 'Private Garden' },
            { id: 8, projectId: 3, name: 'Car Parking' },
            { id: 9, projectId: 3, name: 'Solar Panels' },
          ],
          media: [],
        },
        {
          id: 4,
          name: 'Metro Business Park',
          location: 'Gurgaon, Delhi NCR',
          status: 'completed',
          priceRange: '₹1.2Cr - ₹4.5Cr',
          developerId: 4,
          developer: { id: 4, name: 'Metro Developers', isActive: true },
          isActive: true,
          createdAt: '2022-01-01T00:00:00Z',
          updatedAt: '2023-06-01T00:00:00Z',
          amenities: [
            { id: 10, projectId: 4, name: 'Conference Rooms' },
            { id: 11, projectId: 4, name: 'Food Court' },
            { id: 12, projectId: 4, name: 'Parking' },
          ],
          media: [],
        },
      ];
      
      setProjects(mockProjects);
    } catch (err: any) {
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await projectsApi.deleteProject(id);
      if (response.success) {
        setProjects(projects.filter(project => project.id !== id));
      } else {
        alert(response.message || 'Failed to delete project');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to delete project');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'under_construction':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready_to_move':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    // Removed as Project type doesn't have type property
    return 'bg-purple-100 text-purple-800';
  };

  if (loading && projects.length === 0) {
    return (
      <DashboardLayout title="Projects">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Projects"
      actions={
        <div className="flex items-center space-x-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              List
            </button>
          </div>
          <Link
            href="/projects/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm text-sm font-medium transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Project
          </Link>
        </div>
      }
    >
      {/* Filters */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-200 mb-6 p-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1 w-full sm:w-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects by name, client, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-blue-500 focus:border-blue-500 block w-full"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filters.type || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value || undefined }))}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="villa">Villa</option>
              <option value="apartment">Apartment</option>
            </select>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value || undefined }))}
              className="border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading projects</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={loadProjects}
                  className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Try again
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group">
              {/* Project Image */}
              <div className="relative h-48 bg-gray-100">
                {project.media && project.media.length > 0 ? (
                  <Image
                    src={project.media[0].filePath}
                    alt={project.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <PhotoIcon className="h-12 w-12 text-gray-300" />
                  </div>
                )}
                <div className="absolute top-4 left-4 flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {project.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center space-x-1">
                    <Link
                      href={`/projects/${project.id}`}
                      className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <EyeIcon className="h-4 w-4 text-gray-600" />
                    </Link>
                    <Link
                      href={`/projects/${project.id}/edit`}
                      className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <PencilIcon className="h-4 w-4 text-gray-600" />
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-2 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Project Info */}
              <div className="p-6">
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.name}</h3>
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {project.location}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Developer</span>
                    <span className="font-medium text-gray-900">{project.developer?.name || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Price Range</span>
                    <span className="font-medium text-gray-900">
                      {project.priceRange || 'N/A'}
                    </span>
                  </div>
                </div>

                {project.amenities && project.amenities.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-1">
                      {project.amenities.slice(0, 3).map((amenity) => (
                        <span key={amenity.id} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                          {amenity.name}
                        </span>
                      ))}
                      {project.amenities.length > 3 && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                          +{project.amenities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <div className="text-xs text-gray-500">
                    Created {formatDate(project.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Projects List View */
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Developer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Launch Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => (
                  <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-12 w-12 shrink-0">
                          {project.media && project.media.length > 0 ? (
                            <Image
                              src={project.media[0].filePath}
                              alt={project.name}
                              width={48}
                              height={48}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <BuildingOfficeIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{project.name}</div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <MapPinIcon className="h-3 w-3 mr-1" />
                            {project.location}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{project.developer?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {project.priceRange || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      N/A
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/projects/${project.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {projects.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
            <BuildingOfficeIcon className="h-full w-full" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500 mb-6">
            Get started by adding your first project to the CRM.
          </p>
          <Link
            href="/projects/new"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add First Project
          </Link>
        </div>
      )}

      {/* Loading More */}
      {loading && projects.length > 0 && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      )}
    </DashboardLayout>
  );
}