import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/theme-provider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppLayout } from '@/components/AppLayout';

import LandingPage from '@/pages/public/LandingPage';
import LoginPage from '@/pages/public/LoginPage';
import RegisterPage from '@/pages/public/RegisterPage';

import StudentDashboard from '@/pages/student/StudentDashboard';
import BookRide from '@/pages/student/BookRide';
import RideHistory from '@/pages/student/RideHistory';
import LiveRide from '@/pages/student/LiveRide';
import StudentSettings from '@/pages/student/StudentSettings';

import DriverDashboard from '@/pages/driver/DriverDashboard';
import DriverRegister from '@/pages/driver/DriverRegister';
import DriverTrips from '@/pages/driver/DriverTrips';
import DriverSettings from '@/pages/driver/DriverSettings';

import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminDrivers from '@/pages/admin/AdminDrivers';
import AdminStudents from '@/pages/admin/AdminStudents';
import AdminBookings from '@/pages/admin/AdminBookings';

// Configure api-client to use token from localStorage
setAuthTokenGetter(() => localStorage.getItem('prebet_token'));

const queryClient = new QueryClient();

function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-muted-foreground">Page not found.</p>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/driver/register" component={DriverRegister} />

      {/* Student Routes */}
      <Route path="/student/dashboard">
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><StudentDashboard /></AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/student/book">
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><BookRide /></AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/student/rides">
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><RideHistory /></AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/student/ride/:id">
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><LiveRide /></AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/student/settings">
        <ProtectedRoute allowedRoles={['student']}>
          <AppLayout><StudentSettings /></AppLayout>
        </ProtectedRoute>
      </Route>

      {/* Driver Routes */}
      <Route path="/driver/dashboard">
        <ProtectedRoute allowedRoles={['driver']}>
          <AppLayout><DriverDashboard /></AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/driver/rides">
        <ProtectedRoute allowedRoles={['driver']}>
          <AppLayout><DriverTrips /></AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/driver/settings">
        <ProtectedRoute allowedRoles={['driver']}>
          <AppLayout><DriverSettings /></AppLayout>
        </ProtectedRoute>
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/dashboard">
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><AdminDashboard /></AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/drivers">
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><AdminDrivers /></AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/students">
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><AdminStudents /></AppLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/bookings">
        <ProtectedRoute allowedRoles={['admin']}>
          <AppLayout><AdminBookings /></AppLayout>
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthProvider>
            <TooltipProvider>
              <Router />
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </WouterRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
