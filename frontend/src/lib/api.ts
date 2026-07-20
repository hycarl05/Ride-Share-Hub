import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Base Axios instance pointing to Laravel backend
export const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api', // Laravel default API URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

let tokenGetter: () => string | null = () => null;

export const setAuthTokenGetter = (getter: () => string | null) => {
  tokenGetter = getter;
};

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = tokenGetter();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// TYPES
export type UserRole = 'student' | 'driver' | 'admin';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  student_id?: string;
  profile_photo?: string;
}

// ==========================================
// AUTH HOOKS
// ==========================================

export function useLogin() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/auth/login', data);
      return res.data;
    }
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/auth/register', data);
      return res.data;
    }
  });
}

export function useRegisterDriver() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/drivers/apply', data);
      return res.data;
    }
  });
}

export function useUpdateUser() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.put('/user/profile', data);
      return res.data;
    }
  });
}

// ==========================================
// STUDENT HOOKS
// ==========================================

export function useGetStudentDashboard() {
  return useQuery({
    queryKey: ['studentDashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/student/dashboard');
      return res.data;
    }
  });
}

// ==========================================
// BOOKING HOOKS
// ==========================================

export function useEstimateFare() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/bookings/estimate', data);
      return res.data;
    }
  });
}

export function useCreateBooking() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.post('/bookings', data);
      return res.data;
    }
  });
}

export function useGetBooking(id?: number | string) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const res = await apiClient.get(`/bookings/${id}`);
      return res.data;
    },
    enabled: !!id
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number | string) => {
      const res = await apiClient.post(`/bookings/${id}/cancel`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['booking'] })
  });
}

export function useListBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await apiClient.get('/bookings');
      return res.data;
    }
  });
}

// ==========================================
// DRIVER HOOKS
// ==========================================

export function useGetDriverDashboard() {
  return useQuery({
    queryKey: ['driverDashboard'],
    queryFn: async () => {
      const res = await apiClient.get('/driver/dashboard');
      return res.data;
    }
  });
}

export function useToggleDriverOnline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { isOnline: boolean }) => {
      const res = await apiClient.post('/driver/toggle-status', data);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['driverDashboard'] })
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const res = await apiClient.put(`/bookings/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['booking'] })
  });
}

export function useAcceptBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.post(`/bookings/${id}/accept`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['driverDashboard'] });
    }
  });
}

export function useUpdateDriver() {
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await apiClient.put('/driver/profile', data);
      return res.data;
    }
  });
}

// ==========================================
// ADMIN HOOKS
// ==========================================

export function useGetAdminStats() {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/stats');
      return res.data;
    }
  });
}

export function useListUsers() {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/users');
      return res.data;
    }
  });
}

export function useListDrivers() {
  return useQuery({
    queryKey: ['adminDrivers'],
    queryFn: async () => {
      const res = await apiClient.get('/admin/drivers');
      return res.data;
    }
  });
}

export function useApproveDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.post(`/admin/drivers/${id}/approve`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminDrivers'] })
  });
}

export function useRejectDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.post(`/admin/drivers/${id}/reject`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminDrivers'] })
  });
}

export function useSuspendDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiClient.post(`/admin/drivers/${id}/suspend`);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminDrivers'] })
  });
}
