'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/store/authStore';
import { cn } from '@/lib/utils';
import {
  HomeIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BoltIcon,
  MegaphoneIcon,
  RssIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<any>;
  roles?: string[];
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Leads', href: '/leads', icon: UserGroupIcon },
  { name: 'Campaigns', href: '/campaigns', icon: MegaphoneIcon, roles: ['super_admin', 'admin', 'manager'] },
  { name: 'Sources', href: '/sources', icon: RssIcon, roles: ['super_admin', 'admin', 'manager'] },
  { name: 'Projects', href: '/projects', icon: BuildingOfficeIcon, roles: ['super_admin', 'admin', 'manager'] },
  { name: 'Deals', href: '/deals', icon: CurrencyDollarIcon },
  { name: 'Communication', href: '/communication', icon: ChatBubbleLeftRightIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon, roles: ['super_admin', 'admin', 'manager'] },
  { name: 'Automation', href: '/automation', icon: BoltIcon, roles: ['super_admin', 'admin', 'manager'] },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon, roles: ['super_admin', 'admin'] },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, hasAnyRole } = useAuth();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === href;
    return pathname.startsWith(href);
  };

  const canAccess = (item: NavigationItem) => {
    if (!item.roles) return true;
    return hasAnyRole(item.roles);
  };

  const filteredNavigation = navigation.filter(canAccess);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-gray-900/50 lg:hidden z-40" onClick={() => setIsOpen(false)} />
      )}

      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
            <Link href="/dashboard" className="flex items-center space-x-2 group">
              <div className="relative">
                <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                  <span className="text-white font-bold">M</span>
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Modern CRM</h1>
                <p className="text-xs text-gray-500">Real Estate</p>
              </div>
            </Link>
            <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 rounded-lg text-gray-400">
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all',
                    active ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-700 hover:bg-gray-50'
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className={cn('h-5 w-5 mr-3 shrink-0', active ? 'text-blue-600' : 'text-gray-400')} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-200 p-3 bg-gray-50">
            <div className="flex items-center space-x-2 px-2 py-2 bg-white rounded-lg shadow-sm mb-2">
              <div className="w-9 h-9 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-semibold text-sm">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate capitalize">{user?.role?.replace('_', ' ')}</p>
              </div>
            </div>
            <button onClick={logout} className="flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
              <ArrowLeftOnRectangleIcon className="mr-2 h-4 w-4 shrink-0" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="lg:hidden p-2 rounded-xl text-gray-600">
      <Bars3Icon className="h-6 w-6" />
    </button>
  );
}