import { AnimatedPage } from "@/components/AnimatedPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetStudentDashboard } from "@/lib/api";
import { MapPin, Navigation, Clock, Activity, Loader2, ArrowRight, ShieldAlert, Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function StudentDashboard() {
  const [, setLocation] = useLocation();
  const { data: dashboard, isLoading, error } = useGetStudentDashboard({
    query: { queryKey: ['studentDashboard'] }
  });

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Fallback data for empty API response
  const activeBooking = dashboard?.activeBooking || null;
  const recentBookings = dashboard?.recentBookings || [];

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back. Where to next?</p>
        </div>
        <Button asChild size="lg" className="rounded-full w-full sm:w-auto shadow-md shadow-primary/20">
          <Link href="/student/book">
            <Navigation className="w-4 h-4 mr-2" /> Book a Ride
          </Link>
        </Button>
      </div>

      {activeBooking && (
        <Card className="border-primary/20 shadow-md shadow-primary/5 bg-blue-50/30 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <Badge variant="default" className="mb-2">Active Ride</Badge>
                <h3 className="font-semibold text-lg">In Progress</h3>
              </div>
              <Button size="sm" variant="outline" onClick={() => setLocation(`/student/ride/${activeBooking.id}`)}>
                View Live Status <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-medium">
              <div className="flex flex-col items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <div className="w-0.5 h-6 bg-border" />
                <div className="w-2 h-2 rounded-full bg-secondary" />
              </div>
              <div className="flex flex-col gap-3 flex-1">
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Pickup</p>
                  <p className="truncate">{activeBooking.pickupLocation}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">Destination</p>
                  <p className="truncate">{activeBooking.destination}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Activity className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Total Rides</p>
            </div>
            <p className="text-3xl font-bold">{dashboard?.totalRides || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
            </div>
            <p className="text-3xl font-bold">{dashboard?.completedRides || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600">
                <span className="font-bold text-lg leading-none py-[1px]">RM</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Total Spent</p>
            </div>
            <p className="text-3xl font-bold">{(dashboard?.totalSpent || 0).toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 mt-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Recent Trips</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/student/rides">View All</Link>
          </Button>
        </div>
        
        {recentBookings.length === 0 ? (
          <Card className="bg-muted/50 border-dashed border-2">
            <CardContent className="p-12 text-center text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>No recent trips found.</p>
              <Button variant="link" asChild className="mt-2 text-primary">
                <Link href="/student/book">Book your first ride</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {recentBookings.slice(0, 4).map((booking) => (
              <Card key={booking.id} className="hover-elevate cursor-pointer border hover:border-primary/30 transition-all">
                <CardContent className="p-5 flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <Car className="w-6 h-6 text-slate-500" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between mb-1">
                      <p className="font-semibold truncate">{booking.destination}</p>
                      <p className="font-semibold text-primary shrink-0">RM{booking.fareEstimate.toFixed(2)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {format(new Date(booking.createdAt), 'MMM d, h:mm a')}
                    </p>
                    <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                      {booking.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
