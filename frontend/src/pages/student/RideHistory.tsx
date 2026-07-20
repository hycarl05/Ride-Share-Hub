import { AnimatedPage } from "@/components/AnimatedPage";
import { useListBookings } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { MapPin, Navigation, Clock, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function RideHistory() {
  const { user } = useAuth();
  const { data: bookings, isLoading } = useListBookings({
    studentId: user?.id
  }, { query: { queryKey: ['studentBookings', user?.id], enabled: !!user?.id } });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'cancelled': return 'destructive';
      case 'in_progress':
      case 'arriving':
      case 'accepted': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <AnimatedPage>
      <h1 className="text-3xl font-bold tracking-tight mb-2">My Rides</h1>
      <p className="text-muted-foreground mb-8">Your trip history and past bookings.</p>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !bookings || bookings.length === 0 ? (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium">No rides yet</h3>
          <p className="text-muted-foreground mt-1">Book your first ride to see it here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Link key={booking.id} href={`/student/ride/${booking.id}`}>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer group">
                <CardContent className="p-5 flex flex-col sm:flex-row gap-4 sm:items-center">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant={getStatusColor(booking.status) as any} className="uppercase text-[10px]">
                        {booking.status.replace('_', ' ')}
                      </Badge>
                      <span className="font-bold text-primary">RM {booking.fareEstimate.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center mt-1">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                        <div className="w-0.5 h-6 bg-border" />
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-sm font-medium leading-none">{booking.pickupLocation}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{booking.destination}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="sm:border-l border-t sm:border-t-0 pt-4 sm:pt-0 sm:pl-4 flex sm:flex-col justify-between sm:justify-center items-center sm:items-end gap-2 text-sm text-muted-foreground min-w-[120px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {format(new Date(booking.createdAt), 'MMM d, yyyy')}
                    </span>
                    <span>{format(new Date(booking.createdAt), 'h:mm a')}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </AnimatedPage>
  );
}
