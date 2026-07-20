import { useState } from "react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { useListBookings } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function AdminBookings() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { data: bookings, isLoading } = useListBookings({ status: statusFilter });

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">All Bookings</h1>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={statusFilter === undefined ? "default" : "outline"} onClick={() => setStatusFilter(undefined)}>All</Button>
          <Button size="sm" variant={statusFilter === 'searching' ? "default" : "outline"} onClick={() => setStatusFilter('searching')}>Searching</Button>
          <Button size="sm" variant={statusFilter === 'in_progress' ? "default" : "outline"} onClick={() => setStatusFilter('in_progress')}>In Progress</Button>
          <Button size="sm" variant={statusFilter === 'completed' ? "default" : "outline"} onClick={() => setStatusFilter('completed')}>Completed</Button>
          <Button size="sm" variant={statusFilter === 'cancelled' ? "default" : "outline"} onClick={() => setStatusFilter('cancelled')}>Cancelled</Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>ID & Time</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Fare</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings?.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="font-mono text-xs mb-1">#{booking.id}</div>
                      <div className="font-medium text-sm">{format(new Date(booking.createdAt), 'MMM d')}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(booking.createdAt), 'h:mm a')}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm max-w-[200px]">
                        <p className="truncate" title={booking.pickupLocation}><span className="text-muted-foreground font-bold text-xs uppercase mr-1">From</span>{booking.pickupLocation}</p>
                        <p className="truncate" title={booking.destination}><span className="text-muted-foreground font-bold text-xs uppercase mr-1">To</span>{booking.destination}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{booking.student?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{booking.student?.phone}</p>
                    </TableCell>
                    <TableCell>
                      {booking.driver ? (
                        <>
                          <p className="font-medium">{booking.driver.name}</p>
                          <p className="text-xs text-muted-foreground">{booking.driver.vehiclePlate}</p>
                        </>
                      ) : (
                        <span className="text-muted-foreground text-sm italic">None assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(booking.status) as any} className="uppercase text-[10px]">
                        {booking.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      RM {booking.fareEstimate.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                {!bookings?.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No bookings found matching criteria.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </AnimatedPage>
  );
}
