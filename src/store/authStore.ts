import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, ApiResponse } from '@/types';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: { name: string; email: string; password: string; role?: string }) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        try {
          const response: ApiResponse = await authApi.login({ email, password });
          
          if (response.success && response.data) {
            const { token, user } = response.data;
            
            // Store in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            
            toast.success('Login successful!');
            return true;
          } else {
            toast.error(response.message || 'Login failed');
            return false;
          }
        } catch (error: any) {
          const errorMessage = error?.message || 'Login failed. Please try again.';
          toast.error(errorMessage);
          set({ isLoading: false });
          return false;
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        
        try {
          const response = await authApi.register(userData);
          
          if (response.success) {
            toast.success('Registration successful! Please login.');
            set({ isLoading: false });
            return true;
          } else {
            toast.error(response.message || 'Registration failed');
            set({ isLoading: false });
            return false;
          }
        } catch (error: any) {
          const errorMessage = error?.message || 'Registration failed. Please try again.';
          toast.error(errorMessage);
          set({ isLoading: false });
          return false;
        }
      },

      logout: () => {
        // Call logout API (optional, fire and forget)
        authApi.logout().catch(() => {
          // Ignore errors on logout
        });
        
        // Clear local storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear state
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        
        toast.success('Logged out successfully');
        
        // Redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true });
        
        try {
          const response = await authApi.updateProfile(data);
          
          if (response.success && response.data) {
            const updatedUser = response.data;
            
            // Update localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            set({
              user: updatedUser,
              isLoading: false,
            });
            
            toast.success('Profile updated successfully!');
            return true;
          } else {
            toast.error(response.message || 'Profile update failed');
            set({ isLoading: false });
            return false;
          }
        } catch (error: any) {
          const errorMessage = error?.message || 'Profile update failed. Please try again.';
          toast.error(errorMessage);
          set({ isLoading: false });
          return false;
        }
      },

      refreshToken: async () => {
        try {
          const response = await authApi.refreshToken();
          
          if (response.success && response.data) {
            const { token, user } = response.data;
            
            // Update localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            set({
              token,
              user,
              isAuthenticated: true,
            });
            
            return true;
          } else {
            // Refresh failed, logout user
            get().logout();
            return false;
          }
        } catch (error) {
          // Refresh failed, logout user
          get().logout();
          return false;
        }
      },

      setUser: (user: User) => {
        set({ user });
        localStorage.setItem('user', JSON.stringify(user));
      },

      setToken: (token: string) => {
        set({ token, isAuthenticated: true });
        localStorage.setItem('token', token);
      },

      clearAuth: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Initialize from localStorage on hydration
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('token');
          const userStr = localStorage.getItem('user');
          
          if (token && userStr) {
            try {
              const user = JSON.parse(userStr);
              state?.setToken(token);
              state?.setUser(user);
            } catch (error) {
              // Clear invalid data
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              state?.clearAuth();
            }
          }
        }
      },
    }
  )
);

// Auth helper functions
export const useAuth = () => {
  const store = useAuthStore();
  return {
    ...store,
    hasRole: (role: string) => store.user?.role === role,
    hasAnyRole: (roles: string[]) => roles.includes(store.user?.role || ''),
    isAdmin: () => ['super_admin', 'admin'].includes(store.user?.role || ''),
    isManager: () => ['super_admin', 'admin', 'manager'].includes(store.user?.role || ''),
    canManageUsers: () => ['super_admin', 'admin'].includes(store.user?.role || ''),
    canManageProjects: () => ['super_admin', 'admin', 'manager'].includes(store.user?.role || ''),
    canViewAnalytics: () => ['super_admin', 'admin', 'manager'].includes(store.user?.role || ''),
  };
};

// Check if user is authenticated (for use in components)
export const useIsAuthenticated = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  return isAuthenticated && !!user;
};