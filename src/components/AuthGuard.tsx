'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/store/authStore';
import { Toaster } from 'react-hot-toast';

interface AuthGuardProps {
  children: ReactNode;
}

const publicRoutes = ['/login', '/register', '/forgot-password'];

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, token } = useAuth();

  useEffect(() => {
    // Check if current route is public
    const isPublicRoute = publicRoutes.includes(pathname);
    
    // If not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/login');
      return;
    }
    
    // If authenticated and trying to access public route, redirect to dashboard
    if (isAuthenticated && isPublicRoute) {
      router.push('/dashboard');
      return;
    }
    
    // If authenticated but no user data, something's wrong - logout
    if (isAuthenticated && !user) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, user, pathname, router, token]);

  // Show loading or nothing while redirecting
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            style: {
              background: '#10b981',
            },
          },
          error: {
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
    </>
  );
}