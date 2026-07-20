<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class FareController extends Controller
{
    private const LOCATIONS = [
        "Kolej Kediaman Za'ba" => ['lat' => 3.748, 'lng' => 101.519],
        "Kolej Kediaman Pendeta Za'ba" => ['lat' => 3.748, 'lng' => 101.519],
        "Fakulti Sains dan Matematik" => ['lat' => 3.750, 'lng' => 101.522],
        "Fakulti Pendidikan dan Pembangunan Manusia" => ['lat' => 3.751, 'lng' => 101.521],
        "Dewan Besar UPSI" => ['lat' => 3.749, 'lng' => 101.520],
        "Pasar Besar Tanjong Malim" => ['lat' => 3.681, 'lng' => 101.509],
        "Terminal Bas Tanjong Malim" => ['lat' => 3.682, 'lng' => 101.508],
        "Petronas Tanjong Malim" => ['lat' => 3.685, 'lng' => 101.512],
        "Hospital Slim River" => ['lat' => 3.820, 'lng' => 101.393],
        "Pusat Bandar Tanjong Malim" => ['lat' => 3.682, 'lng' => 101.509],
    ];

    private function haversineDistance($lat1, $lng1, $lat2, $lng2)
    {
        $R = 6371; // km
        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLng / 2) * sin($dLng / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $R * $c;
    }

    public function estimate(Request $request)
    {
        $pickup = $request->pickupLocation;
        $destination = $request->destination;

        if (!$pickup || !$destination) {
            return response()->json(['error' => 'Missing pickupLocation or destination'], 400);
        }

        $from = self::LOCATIONS[$pickup] ?? null;
        $to = self::LOCATIONS[$destination] ?? null;

        if ($from && $to) {
            $distance = $this->haversineDistance($from['lat'], $from['lng'], $to['lat'], $to['lng']);
        } else {
            // Fallback: random-ish estimate based on string length difference (demo)
            $distance = max(1.0, abs(strlen($pickup) - strlen($destination)) * 0.3 + 2.0);
        }

        $baseFare = 2.0;
        $perKm = 1.5;
        $fare = round(($baseFare + $distance * $perKm) * 100) / 100;
        $time = round($distance * 3 + 5); // ~3 min/km + 5 min base

        return response()->json([
            'estimatedFare' => $fare,
            'estimatedTime' => $time,
            'distance' => round($distance * 10) / 10,
        ]);
    }
}
