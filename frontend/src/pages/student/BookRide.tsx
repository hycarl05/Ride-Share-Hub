import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { AnimatedPage } from "@/components/AnimatedPage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2, Info } from "lucide-react";
import { useEstimateFare, useCreateBooking, useGetBooking } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function BookRide() {
  const [, setLocation] = useLocation();
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [notes, setNotes] = useState("");
  
  const estimateFareMutation = useEstimateFare();
  const createBookingMutation = useCreateBooking();
  
  const [fareData, setFareData] = useState<{estimatedFare: number; estimatedTime: number; distance: number} | null>(null);
  const [bookingId, setBookingId] = useState<number | null>(null);

  // Debounced fare estimation
  const debounceRef = useRef<NodeJS.Timeout>();
  
  useEffect(() => {
    if (pickup.length > 3 && destination.length > 3) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        estimateFareMutation.mutate(
          { pickupLocation: pickup, destination },
          {
            onSuccess: (res) => setFareData(res),
          }
        );
      }, 800);
    }
  }, [pickup, destination]);

  // Polling for booking status when searching
  const { data: booking } = useGetBooking(bookingId!, {
    query: {
      enabled: !!bookingId,
      queryKey: ['booking', bookingId],
      refetchInterval: (query) => {
        const state = query.state.data;
        return state?.status === 'searching' ? 3000 : false;
      }
    }
  });

  useEffect(() => {
    if (booking?.status === 'accepted') {
      toast.success("Driver found!");
      setLocation(`/student/ride/${booking.id}`);
    }
  }, [booking?.status, setLocation]);

  const handleBook = () => {
    if (!pickup || !destination) {
      toast.error("Please enter pickup and destination");
      return;
    }

    createBookingMutation.mutate(
      { 
        pickupLocation: pickup, 
        destination, 
        notes,
        fareEstimate: fareData?.estimatedFare || 5.00
      },
      {
        onSuccess: (res) => {
          setBookingId(res.id);
        },
        onError: () => toast.error("Failed to create booking")
      }
    );
  };

  const cancelSearch = () => {
    setBookingId(null);
    toast("Search cancelled");
  };

  return (
    <AnimatedPage className="max-w-2xl mx-auto h-full flex flex-col">
      <h1 className="text-3xl font-bold tracking-tight mb-6">Book a Ride</h1>
      
      <AnimatePresence mode="wait">
        {!bookingId ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
            <Card className="border-0 shadow-lg mb-6">
              <CardContent className="p-6 space-y-6">
                <div className="relative">
                  <div className="absolute left-4 top-5 flex flex-col items-center gap-1 z-10">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <div className="w-0.5 h-10 bg-border" />
                    <div className="w-3 h-3 rounded-full bg-secondary" />
                  </div>
                  
                  <div className="space-y-4 pl-10">
                    <div className="space-y-1">
                      <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Pickup</Label>
                      <Input 
                        placeholder="Current Location (e.g. Komsis Za'ba)" 
                        value={pickup}
                        onChange={(e) => setPickup(e.target.value)}
                        className="h-12 border-0 bg-muted focus-visible:ring-1 focus-visible:bg-background transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wider">Destination</Label>
                      <Input 
                        placeholder="Where to? (e.g. KSAS)" 
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        className="h-12 border-0 bg-muted focus-visible:ring-1 focus-visible:bg-background transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Notes for driver (Optional)</Label>
                  <Input 
                    placeholder="Waiting at the main gate..." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {fareData && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="mb-6 bg-primary text-primary-foreground border-0 shadow-md">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-xl">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-medium opacity-90">Prebet Standard</p>
                        <p className="text-xs opacity-75">{fareData.distance.toFixed(1)} km • ~{fareData.estimatedTime} min</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">RM {fareData.estimatedFare.toFixed(2)}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            <Button 
              size="lg" 
              className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/25"
              onClick={handleBook}
              disabled={!pickup || !destination || createBookingMutation.isPending}
            >
              {createBookingMutation.isPending ? "Creating..." : "Confirm Booking"}
            </Button>
            
            <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground justify-center">
              <Info className="w-4 h-4" /> Wait times may vary based on driver availability.
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="searching"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 flex flex-col items-center justify-center min-h-[60vh]"
          >
            <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
              <motion.div 
                className="absolute inset-0 rounded-full border-[3px] border-primary/20"
                animate={{ scale: [1, 1.5, 2], opacity: [1, 0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-4 rounded-full border-[3px] border-primary/40"
                animate={{ scale: [1, 1.4, 1.8], opacity: [1, 0.6, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
              />
              <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-xl z-10 text-white">
                <Navigation className="w-8 h-8" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-2">Searching for a driver...</h2>
            <p className="text-muted-foreground text-center max-w-sm mb-10">
              We're notifying verified campus drivers nearby. Please hold on.
            </p>
            
            <Card className="w-full max-w-sm border-0 shadow-md mb-8">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Destination</p>
                  <p className="font-medium truncate">{destination}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Fare</p>
                  <p className="font-bold text-primary">RM {fareData?.estimatedFare.toFixed(2) || '5.00'}</p>
                </div>
              </CardContent>
            </Card>
            
            <Button variant="outline" size="lg" onClick={cancelSearch} className="rounded-full px-8">
              Cancel Search
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
}
