import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Redirect } from 'wouter';

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to their respective dashboards if they try to access unauthorized routes
    if (role === 'student') return <Redirect to="/student/dashboard" />;
    if (role === 'driver') return <Redirect to="/driver/dashboard" />;
    if (role === 'admin') return <Redirect to="/admin/dashboard" />;
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}
