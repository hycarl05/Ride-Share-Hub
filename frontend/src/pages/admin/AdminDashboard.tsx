import { AnimatedPage } from "@/components/AnimatedPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAdminStats } from "@/lib/api";
import { Loader2, Users, Car, CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetAdminStats({
    query: { queryKey: ['adminStats'], refetchInterval: 10000 }
  });

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
          <p className="text-muted-foreground">Platform statistics and recent activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col justify-center text-center items-center h-full">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-3"><Users className="w-5 h-5" /></div>
            <p className="text-2xl font-bold">{stats?.totalStudents || 0}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center text-center items-center h-full">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full mb-3"><Car className="w-5 h-5" /></div>
            <p className="text-2xl font-bold">{stats?.totalDrivers || 0}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Total Drivers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center text-center items-center h-full">
            <div className="p-3 bg-green-100 text-green-600 rounded-full mb-3"><CheckCircle className="w-5 h-5" /></div>
            <p className="text-2xl font-bold">{stats?.activeDrivers || 0}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Active Now</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center text-center items-center h-full relative overflow-hidden">
            {stats?.pendingVerifications ? <div className="absolute top-0 right-0 w-2 h-full bg-orange-500" /> : null}
            <div className="p-3 bg-orange-100 text-orange-600 rounded-full mb-3"><AlertTriangle className="w-5 h-5" /></div>
            <p className="text-2xl font-bold">{stats?.pendingVerifications || 0}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Pending Docs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center text-center items-center h-full">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-full mb-3"><Clock className="w-5 h-5" /></div>
            <p className="text-2xl font-bold">{stats?.completedTrips || 0}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Trips Done</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center text-center items-center h-full">
            <div className="p-3 bg-primary/10 text-primary rounded-full mb-3"><TrendingUp className="w-5 h-5" /></div>
            <p className="text-2xl font-bold">RM {(stats?.totalRevenue || 0).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">Platform Vol</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mt-8">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Bookings</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/bookings">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats?.recentBookings && stats.recentBookings.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentBookings.map((b) => (
                    <TableRow key={b.id}>
                      <TableCell className="whitespace-nowrap">{format(new Date(b.createdAt), 'h:mm a')}</TableCell>
                      <TableCell className="font-medium">{b.student?.name || 'Unknown'}</TableCell>
                      <TableCell className="max-w-[150px] truncate" title={`${b.pickupLocation} to ${b.destination}`}>
                        {b.pickupLocation} <span className="text-muted-foreground mx-1">→</span> {b.destination}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(b.status) as any} className="uppercase text-[10px] whitespace-nowrap">
                          {b.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">No recent bookings</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Needs Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-10">
              <p className="text-4xl font-bold mb-2">{stats?.pendingVerifications || 0}</p>
              <p className="text-muted-foreground mb-6">Driver applications waiting for verification.</p>
              <Button asChild className="w-full">
                <Link href="/admin/drivers">Review Applications</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}
