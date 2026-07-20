import { AnimatedPage } from "@/components/AnimatedPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useUpdateDriver } from "@workspace/api-client-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DriverSettings() {
  const { user } = useAuth();
  const updateMutation = useUpdateDriver();
  
  // We'd typically load the driver details first, using mock values for now
  const [vehicleType, setVehicleType] = useState('Perodua Myvi');
  const [vehiclePlate, setVehiclePlate] = useState('ABC 1234');

  const handleSave = () => {
    updateMutation.mutate(
      { id: user?.id || 0, data: { vehicleType, vehiclePlate } },
      {
        onSuccess: () => toast.success("Vehicle details updated"),
        onError: () => toast.error("Failed to update details")
      }
    );
  };

  return (
    <AnimatedPage className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Driver Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Vehicle Model</Label>
              <Input value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>License Plate</Label>
              <Input value={vehiclePlate} onChange={(e) => setVehiclePlate(e.target.value)} className="uppercase" />
            </div>
          </div>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Vehicle"}
          </Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>Driver status: <span className="font-bold text-green-600">Approved</span></p>
          <p>IC Number: <span className="font-mono">••••••••1234</span></p>
          <p>To update sensitive documents like your License or IC, please visit the admin office in person.</p>
        </CardContent>
      </Card>
    </AnimatedPage>
  );
}
