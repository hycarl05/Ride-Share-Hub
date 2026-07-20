import { useState } from "react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { useListDrivers, useApproveDriver, useRejectDriver, useSuspendDriver } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Check, X, Ban, FileImage, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AdminDrivers() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { data: drivers, isLoading, refetch } = useListDrivers({ status: statusFilter });
  
  const approveMutation = useApproveDriver();
  const rejectMutation = useRejectDriver();
  const suspendMutation = useSuspendDriver();

  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const handleApprove = (id: number) => {
    approveMutation.mutate({ id }, {
      onSuccess: () => {
        toast.success("Driver approved successfully");
        refetch();
      }
    });
  };

  const handleReject = () => {
    if (!selectedDriver || !rejectReason) return;
    rejectMutation.mutate({ id: selectedDriver.id, data: { reason: rejectReason } }, {
      onSuccess: () => {
        toast.success("Driver application rejected");
        setRejectDialogOpen(false);
        setRejectReason("");
        refetch();
      }
    });
  };

  const handleSuspend = (id: number) => {
    suspendMutation.mutate({ id }, {
      onSuccess: () => {
        toast.success("Driver suspended");
        refetch();
      }
    });
  };

  return (
    <AnimatedPage className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Drivers Management</h1>
        <div className="flex gap-2">
          <Button variant={statusFilter === undefined ? "default" : "outline"} onClick={() => setStatusFilter(undefined)}>All</Button>
          <Button variant={statusFilter === 'pending' ? "default" : "outline"} onClick={() => setStatusFilter('pending')} className="text-orange-600 border-orange-200 hover:bg-orange-50">Pending</Button>
          <Button variant={statusFilter === 'approved' ? "default" : "outline"} onClick={() => setStatusFilter('approved')}>Approved</Button>
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
                  <TableHead>Driver</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Stats</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers?.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={driver.profilePhoto || undefined} />
                          <AvatarFallback>{driver.name?.charAt(0) || 'D'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{driver.name}</p>
                          <p className="text-xs text-muted-foreground">{driver.phone}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs space-y-1">
                        <p><span className="font-medium">IC:</span> {driver.icNumber}</p>
                        <p><span className="font-medium">License:</span> {driver.licenseNumber}</p>
                        <p><span className="font-medium">Student ID:</span> {driver.studentId || 'N/A'}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{driver.vehicleType}</div>
                      <div className="text-xs bg-slate-100 inline-block px-1.5 py-0.5 mt-1 rounded font-mono">{driver.vehiclePlate}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>★ {driver.rating.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">{driver.totalRides} rides</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        driver.status === 'approved' ? 'success' : 
                        driver.status === 'pending' ? 'warning' : 
                        driver.status === 'suspended' ? 'destructive' : 'secondary'
                      } className="uppercase text-[10px]">
                        {driver.status}
                      </Badge>
                      {driver.isOnline && driver.status === 'approved' && (
                        <div className="mt-1 text-[10px] font-bold text-green-600 flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" /> ONLINE
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {driver.status === 'pending' && (
                        <>
                          <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleApprove(driver.id)}>
                            <Check className="w-4 h-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => {
                            setSelectedDriver(driver);
                            setRejectDialogOpen(true);
                          }}>
                            <X className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </>
                      )}
                      {driver.status === 'approved' && (
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleSuspend(driver.id)}>
                          <Ban className="w-4 h-4 mr-1" /> Suspend
                        </Button>
                      )}
                      {driver.status === 'suspended' && (
                        <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50" onClick={() => handleApprove(driver.id)}>
                          <ShieldCheck className="w-4 h-4 mr-1" /> Re-Approve
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!drivers?.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No drivers found matching criteria.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Application</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting {selectedDriver?.name}'s application. This will be visible to them.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input 
              placeholder="e.g. Blurry IC photo, mismatching plates..." 
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason || rejectMutation.isPending}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
}
