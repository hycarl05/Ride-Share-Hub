import { Router, type IRouter } from "express";

const router: IRouter = Router();

// Known campus locations and their approximate distances from campus center
const LOCATIONS: Record<string, { lat: number; lng: number }> = {
  "Kolej Kediaman Za'ba": { lat: 3.748, lng: 101.519 },
  "Kolej Kediaman Pendeta Za'ba": { lat: 3.748, lng: 101.519 },
  "Fakulti Sains dan Matematik": { lat: 3.750, lng: 101.522 },
  "Fakulti Pendidikan dan Pembangunan Manusia": { lat: 3.751, lng: 101.521 },
  "Dewan Besar UPSI": { lat: 3.749, lng: 101.520 },
  "Pasar Besar Tanjong Malim": { lat: 3.681, lng: 101.509 },
  "Terminal Bas Tanjong Malim": { lat: 3.682, lng: 101.508 },
  "Petronas Tanjong Malim": { lat: 3.685, lng: 101.512 },
  "Hospital Slim River": { lat: 3.820, lng: 101.393 },
  "Pusat Bandar Tanjong Malim": { lat: 3.682, lng: 101.509 },
};

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function estimateForLocations(pickup: string, destination: string): { distance: number; fare: number; time: number } {
  const from = LOCATIONS[pickup];
  const to = LOCATIONS[destination];

  let distance: number;
  if (from && to) {
    distance = haversineDistance(from.lat, from.lng, to.lat, to.lng);
  } else {
    // Fallback: random-ish estimate based on string length difference (demo)
    distance = Math.max(1, Math.abs(pickup.length - destination.length) * 0.3 + 2);
  }

  const baseFare = 2.0;
  const perKm = 1.5;
  const fare = Math.round((baseFare + distance * perKm) * 100) / 100;
  const time = Math.round(distance * 3 + 5); // ~3 min/km + 5 min base

  return { distance: Math.round(distance * 10) / 10, fare, time };
}

router.post("/fare/estimate", async (req, res): Promise<void> => {
  const { pickupLocation, destination } = req.body;
  if (!pickupLocation || !destination) {
    res.status(400).json({ error: "Missing pickupLocation or destination" });
    return;
  }

  const { distance, fare, time } = estimateForLocations(pickupLocation, destination);

  res.json({
    estimatedFare: fare,
    estimatedTime: time,
    distance,
  });
});

export default router;
