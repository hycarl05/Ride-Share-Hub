import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { AnimatedPage } from "@/components/AnimatedPage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useGetBooking, useCancelBooking } from "@workspace/api-client-react";
import { Loader2, Phone, ShieldAlert, Share2, Star, CheckCircle2, Navigation, MessageCircle, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";

const STEPS = ['searching', 'accepted', 'arriving', 'in_progress', 'completed'];

export default function LiveRide() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [sosOpen, setSosOpen] = useState(false);
  
  const { data: booking, isLoading, error } = useGetBooking(Number(id), {
    query: {
      enabled: !!id,
      queryKey: ['booking', Number(id)],
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        return ['completed', 'cancelled'].includes(status || '') ? false : 3000;
      }
    }
  });

  const cancelMutation = useCancelBooking();

  if (isLoading) {
    return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (error || !booking) {
    return <div className="p-8 text-center text-destructive">Ride not found</div>;
  }

  const currentStepIndex = STEPS.indexOf(booking.status);
  const isCancelled = booking.status === 'cancelled';

  const handleCancel = () => {
    cancelMutation.mutate(
      { id: Number(id) },
      {
        onSuccess: () => {
          toast.success("Ride cancelled");
          setLocation('/student/dashboard');
        }
      }
    );
  };

  const handleShare = () => {
    const text = `I'm riding with Prebet UPSI. Driver: ${booking.driver?.name} (${booking.driver?.vehiclePlate}). From ${booking.pickupLocation} to ${booking.destination}.`;
    if (navigator.share) {
      navigator.share({ title: 'My Ride', text });
    } else {
      navigator.clipboard.writeText(text);
      toast.success("Ride info copied to clipboard");
    }
  };

  return (
    <AnimatedPage className="max-w-xl mx-auto h-full flex flex-col space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <h1 className="text-xl font-bold tracking-tight">Ride Status</h1>
        {isCancelled ? (
          <Badge variant="destructive">Cancelled</Badge>
        ) : (
          <Badge className="uppercase tracking-wider">{booking.status.replace('_', ' ')}</Badge>
        )}
      </div>

      {!isCancelled && (
        <Card className="border-0 shadow-md bg-white overflow-hidden">
          <div className="bg-slate-50 p-4 border-b flex justify-between items-center">
            <span className="font-semibold text-sm">Trip Progress</span>
            {booking.estimatedArrival && (
              <span className="text-sm font-bold text-primary flex items-center gap-1">
                <Clock className="w-4 h-4" /> ETA: {new Date(booking.estimatedArrival).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            )}
          </div>
          <CardContent className="p-6">
            <div className="flex flex-col gap-6">
              {STEPS.map((step, index) => {
                const isActive = index === currentStepIndex;
                const isPast = index < currentStepIndex;
                
                return (
                  <div key={step} className={`flex items-center gap-4 ${index > currentStepIndex + 1 ? 'opacity-30' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-primary text-white shadow-lg shadow-primary/30 ring-4 ring-primary/20' : 
                      isPast ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isPast ? <CheckCircle2 className="w-5 h-5" /> : <div className="w-2.5 h-2.5 rounded-full bg-current" />}
                    </div>
                    <div>
                      <p className={`font-semibold capitalize ${isActive ? 'text-primary' : ''}`}>
                        {step.replace('_', ' ')}
                      </p>
                      {isActive && <p className="text-xs text-muted-foreground mt-0.5">Currently in progress</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {booking.driver && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-0">
            <div className="p-6 flex items-center gap-4 border-b">
              <Avatar className="w-16 h-16 border-2 border-slate-100">
                <AvatarImage src={booking.driver.profilePhoto || undefined} />
                <AvatarFallback className="text-xl">{booking.driver.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg leading-none">{booking.driver.name}</h3>
                  {booking.driver.status === 'approved' && (
                    <Badge variant="secondary" className="bg-blue-50 text-primary border-blue-100 hover:bg-blue-50 text-[10px] px-1 py-0 h-4">Verified</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <span>{booking.driver.vehicleType}</span>
                  <span>•</span>
                  <span className="text-foreground bg-slate-100 px-1.5 py-0.5 rounded font-bold">{booking.driver.vehiclePlate}</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 font-bold">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  {booking.driver.rating.toFixed(1)}
                </div>
                <p className="text-xs text-muted-foreground">{booking.driver.totalRides} rides</p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 flex justify-around">
              <Button variant="ghost" className="flex flex-col h-auto py-2 gap-1 px-6">
                <Phone className="w-5 h-5 text-green-600" />
                <span className="text-xs">Call</span>
              </Button>
              <Button variant="ghost" className="flex flex-col h-auto py-2 gap-1 px-6">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <span className="text-xs">Message</span>
              </Button>
              <Button variant="ghost" className="flex flex-col h-auto py-2 gap-1 px-6" onClick={handleShare}>
                <Share2 className="w-5 h-5 text-slate-600" />
                <span className="text-xs">Share</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm bg-slate-50">
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold">Ride Details</span>
            <span className="font-bold text-primary">RM {booking.fareEstimate.toFixed(2)}</span>
          </div>
          <div className="text-sm space-y-2 text-muted-foreground">
            <div className="flex gap-2">
              <Navigation className="w-4 h-4 mt-0.5 shrink-0" />
              <p><span className="font-medium text-foreground block">From:</span> {booking.pickupLocation}</p>
            </div>
            <div className="flex gap-2">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <p><span className="font-medium text-foreground block">To:</span> {booking.destination}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-auto pt-4 flex gap-4">
        {!isCancelled && ['searching', 'accepted'].includes(booking.status) && (
          <Button variant="outline" className="flex-1" onClick={handleCancel} disabled={cancelMutation.isPending}>
            Cancel Ride
          </Button>
        )}
        
        <Dialog open={sosOpen} onOpenChange={setSosOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" className="flex-1 font-bold shadow-lg shadow-destructive/20">
              <ShieldAlert className="w-5 h-5 mr-2" /> SOS
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-destructive flex items-center gap-2 text-xl">
                <ShieldAlert className="w-6 h-6" /> Emergency Assistance
              </DialogTitle>
              <DialogDescription>
                Are you in danger? Contact authorities immediately. Your location and driver details will be shared.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <Button size="lg" className="w-full justify-between h-14 bg-red-600 hover:bg-red-700">
                <span className="text-lg font-bold">Police (999)</span>
                <Phone className="w-5 h-5" />
              </Button>
              <Button size="lg" className="w-full justify-between h-14 bg-primary hover:bg-primary/90">
                <span className="text-lg font-bold">Campus Security</span>
                <Phone className="w-5 h-5" />
              </Button>
              
              <div className="bg-slate-100 p-4 rounded-lg mt-4 text-sm">
                <p className="font-semibold mb-1">Your current ride info:</p>
                <p>Driver: {booking.driver?.name || 'Unknown'}</p>
                <p>Plate: {booking.driver?.vehiclePlate || 'Unknown'}</p>
                <Button variant="outline" size="sm" className="w-full mt-3" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" /> Share Details via WhatsApp
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
}

// Need to import Clock, forgot in the main imports
import { Clock } from "lucide-react";
