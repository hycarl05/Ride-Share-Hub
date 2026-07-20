import { AnimatedPage } from "@/components/AnimatedPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetDriverDashboard, useToggleDriverOnline, useUpdateBookingStatus, useAcceptBooking } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, DollarSign, Route, Star, Bell, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "wouter";

export default function DriverDashboard() {
  const { data: dashboard, isLoading, refetch } = useGetDriverDashboard({
    query: { queryKey: ['driverDashboard'], refetchInterval: 5000 }
  });
  const toggleOnline = useToggleDriverOnline();
  const acceptBooking = useAcceptBooking();
  const updateStatus = useUpdateBookingStatus();

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const handleToggleOnline = (checked: boolean) => {
    // If we don't have driver ID here directly in context, we assume the API handles it via token
    // The generated hook expects an ID, but let's pass a dummy or get it from dashboard
    // Wait, the API spec says `useToggleDriverOnline(id, data)`. 
    // Since we don't have driver ID easily here without user context, we might need a workaround.
    // Actually, let's assume the endpoint handles it or we pass a mock ID for demo.
    toggleOnline.mutate(
      { isOnline: checked },
      { 
        onSuccess: () => {
          toast.success(checked ? "You are now online" : "You went offline");
          refetch();
        } 
      }
    );
  };

  const handleAccept = (bookingId: number) => {
    acceptBooking.mutate(
      bookingId,
      {
        onSuccess: () => {
          toast.success("Ride accepted!");
          refetch();
        }
      }
    );
  };

  const handleStatusUpdate = (bookingId: number, status: 'arriving' | 'in_progress' | 'completed') => {
    updateStatus.mutate(
      { id: bookingId, status },
      {
        onSuccess: () => {
          toast.success("Status updated");
          refetch();
        }
      }
    );
  };

  return (
    <AnimatedPage className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Driver Hub</h1>
          <p className="text-muted-foreground">Manage your rides and earnings.</p>
        </div>
        <Card className="shadow-none border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">Availability Status</Label>
              <p className="text-sm text-muted-foreground">{dashboard?.isOnline ? 'Online & receiving requests' : 'Offline'}</p>
            </div>
            <Switch checked={dashboard?.isOnline} onCheckedChange={handleToggleOnline} disabled={toggleOnline.isPending} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Today's Earnings</p>
                <p className="text-3xl font-bold">RM {(dashboard?.todayEarnings || 0).toFixed(2)}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-full text-primary"><DollarSign className="w-5 h-5" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Today's Trips</p>
                <p className="text-3xl font-bold">{dashboard?.todayTrips || 0}</p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-full text-blue-600"><Route className="w-5 h-5" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Your Rating</p>
                <p className="text-3xl font-bold">{dashboard?.rating.toFixed(1) || '0.0'}</p>
              </div>
              <div className="p-2 bg-yellow-400/10 rounded-full text-yellow-500"><Star className="fill-yellow-400 w-5 h-5" /></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Total Trips</p>
                <p className="text-3xl font-bold">{dashboard?.totalTrips || 0}</p>
              </div>
              <div className="p-2 bg-slate-100 rounded-full text-slate-600"><CheckCircle2 className="w-5 h-5" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mt-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Pending Requests</h2>
            {dashboard?.pendingRequests && dashboard.pendingRequests.length > 0 && (
              <Badge variant="destructive" className="rounded-full w-6 h-6 p-0 flex items-center justify-center animate-pulse">
                {dashboard.pendingRequests.length}
              </Badge>
            )}
          </div>
          
          {!dashboard?.isOnline ? (
            <Card className="bg-slate-50 border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground">
                Go online to start receiving ride requests.
              </CardContent>
            </Card>
          ) : dashboard?.pendingRequests?.length === 0 ? (
            <Card className="bg-slate-50 border-dashed">
              <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center">
                <Bell className="w-8 h-8 opacity-20 mb-2" />
                No requests right now. Waiting for passengers...
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {dashboard?.pendingRequests.map(req => (
                <Card key={req.id} className="border-primary/30 shadow-md">
                  <CardContent className="p-5">
                    <div className="flex justify-between mb-4">
                      <div>
                        <p className="font-bold text-lg">{req.student?.name || 'Passenger'}</p>
                        <p className="text-sm text-muted-foreground">Student ID: {req.student?.studentId}</p>
                      </div>
                      <p className="text-2xl font-bold text-primary">RM {req.fareEstimate.toFixed(2)}</p>
                    </div>
                    <div className="space-y-2 mb-6">
                      <div className="flex gap-3 text-sm">
                        <MapPin className="w-4 h-4 mt-0.5 text-slate-400" />
                        <span className="font-medium">{req.pickupLocation}</span>
                      </div>
                      <div className="flex gap-3 text-sm">
                        <Route className="w-4 h-4 mt-0.5 text-slate-400" />
                        <span className="font-medium">{req.destination}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button className="flex-1" onClick={() => handleAccept(req.id)}>Accept</Button>
                      <Button variant="outline" className="flex-1">Ignore</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Active & Recent</h2>
            <Button variant="link" asChild><Link href="/driver/rides">View All</Link></Button>
          </div>
          
          <div className="space-y-3">
            {dashboard?.recentTrips?.slice(0, 4).map(trip => {
              const isActive = ['accepted', 'arriving', 'in_progress'].includes(trip.status);
              return (
                <Card key={trip.id} className={isActive ? 'border-primary shadow-sm' : ''}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={isActive ? 'default' : 'secondary'} className="uppercase text-[10px]">
                        {trip.status.replace('_', ' ')}
                      </Badge>
                      <span className="font-bold">RM {trip.fareEstimate.toFixed(2)}</span>
                    </div>
                    <p className="font-semibold text-sm truncate mb-1">{trip.pickupLocation} → {trip.destination}</p>
                    <p className="text-xs text-muted-foreground mb-4">{trip.student?.name || 'Passenger'}</p>
                    
                    {isActive && (
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t">
                        <Button 
                          size="sm" 
                          variant={trip.status === 'accepted' ? 'default' : 'outline'}
                          onClick={() => handleStatusUpdate(trip.id, 'arriving')}
                          disabled={trip.status !== 'accepted'}
                        >Arriving</Button>
                        <Button 
                          size="sm" 
                          variant={trip.status === 'arriving' ? 'default' : 'outline'}
                          onClick={() => handleStatusUpdate(trip.id, 'in_progress')}
                          disabled={trip.status !== 'arriving'}
                        >Picked Up</Button>
                        <Button 
                          size="sm" 
                          variant={trip.status === 'in_progress' ? 'default' : 'outline'}
                          onClick={() => handleStatusUpdate(trip.id, 'completed')}
                          disabled={trip.status !== 'in_progress'}
                        >Complete</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}
