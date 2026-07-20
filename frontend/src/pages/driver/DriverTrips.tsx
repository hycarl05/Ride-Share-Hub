import { AnimatedPage } from "@/components/AnimatedPage";
import { useListBookings } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, DollarSign } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function DriverTrips() {
  const { user } = useAuth();
  const { data: trips, isLoading } = useListBookings(
    // Since API spec doesn't expose driverId dynamically well here without real token logic,
    // we assume the API infers driver context from token, or we pass user ID.
    { driverId: user?.id },
    { query: { queryKey: ['driverTrips'] } }
  );

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
    <AnimatedPage className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Trip History</h1>
      <p className="text-muted-foreground mb-6">Review all your past rides and earnings.</p>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : !trips || trips.length === 0 ? (
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="p-12 text-center text-muted-foreground">
            No completed trips yet.
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Passenger</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Fare</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.map((trip) => (
                <TableRow key={trip.id}>
                  <TableCell className="font-medium">
                    {format(new Date(trip.createdAt), 'MMM d, yyyy')}
                    <div className="text-xs text-muted-foreground">{format(new Date(trip.createdAt), 'h:mm a')}</div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[250px] truncate" title={trip.pickupLocation}>{trip.pickupLocation}</div>
                    <div className="text-muted-foreground max-w-[250px] truncate text-xs">to {trip.destination}</div>
                  </TableCell>
                  <TableCell>{trip.student?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(trip.status) as any} className="uppercase text-[10px]">
                      {trip.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold text-primary">
                    RM {trip.fareEstimate.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </AnimatedPage>
  );
}
