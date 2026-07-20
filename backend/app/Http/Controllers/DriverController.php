<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DriverController extends Controller
{
    private function enrichDriver(Driver $driver)
    {
        $driver->load('user');
        return [
            'id' => $driver->id,
            'userId' => $driver->user_id,
            'icNumber' => $driver->ic_number,
            'licenseNumber' => $driver->license_number,
            'vehicleType' => $driver->vehicle_type,
            'vehiclePlate' => $driver->vehicle_plate,
            'profilePhoto' => $driver->profile_photo,
            'vehiclePhoto' => $driver->vehicle_photo,
            'status' => $driver->status,
            'isOnline' => $driver->is_online,
            'rating' => $driver->rating,
            'totalRides' => $driver->total_rides,
            'rejectionReason' => $driver->rejection_reason,
            'createdAt' => $driver->created_at,
            'updatedAt' => $driver->updated_at,
            'name' => $driver->user->name ?? '',
            'email' => $driver->user->email ?? '',
            'phone' => $driver->user->phone ?? '',
            'studentId' => $driver->user->student_id ?? null,
        ];
    }

    public function index(Request $request)
    {
        $query = Driver::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('isOnline')) {
            $online = $request->isOnline === 'true';
            $query->where('is_online', $online);
        }

        $drivers = $query->get();

        $enriched = $drivers->map(function ($d) {
            return $this->enrichDriver($d);
        });

        return response()->json($enriched);
    }

    public function apply(Request $request)
    {
        $currentUser = $request->user();

        $validator = Validator::make($request->all(), [
            'icNumber' => 'required|string',
            'licenseNumber' => 'required|string',
            'vehicleType' => 'required|string',
            'vehiclePlate' => 'required|string',
            'profilePhoto' => 'nullable|string',
            'vehiclePhoto' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $driver = Driver::create([
            'user_id' => $currentUser->id,
            'ic_number' => $request->icNumber,
            'license_number' => $request->licenseNumber,
            'vehicle_type' => $request->vehicleType,
            'vehicle_plate' => $request->vehiclePlate,
            'profile_photo' => $request->profilePhoto,
            'vehicle_photo' => $request->vehiclePhoto,
            'status' => 'pending',
            'is_online' => false,
            'rating' => 0.0,
            'total_rides' => 0,
        ]);

        // Update user role to driver
        $currentUser->update(['role' => 'driver']);

        return response()->json($this->enrichDriver($driver), 201);
    }

    public function available()
    {
        $drivers = Driver::where('status', 'approved')->where('is_online', true)->get();

        $enriched = $drivers->map(function ($d) {
            return $this->enrichDriver($d);
        });

        return response()->json($enriched);
    }

    public function show($id)
    {
        $driver = Driver::find($id);

        if (!$driver) {
            return response()->json(['error' => 'Driver not found'], 404);
        }

        return response()->json($this->enrichDriver($driver));
    }

    public function update(Request $request, $id)
    {
        $driver = Driver::find($id);

        if (!$driver) {
            return response()->json(['error' => 'Driver not found'], 404);
        }

        $updates = [];
        if ($request->has('icNumber')) $updates['ic_number'] = $request->icNumber;
        if ($request->has('licenseNumber')) $updates['license_number'] = $request->licenseNumber;
        if ($request->has('vehicleType')) $updates['vehicle_type'] = $request->vehicleType;
        if ($request->has('vehiclePlate')) $updates['vehicle_plate'] = $request->vehiclePlate;
        if ($request->has('profilePhoto')) $updates['profile_photo'] = $request->profilePhoto;
        if ($request->has('vehiclePhoto')) $updates['vehicle_photo'] = $request->vehiclePhoto;

        $driver->update($updates);

        return response()->json($this->enrichDriver($driver));
    }

    public function toggleOnline(Request $request, $id)
    {
        $driver = Driver::find($id);

        if (!$driver) {
            return response()->json(['error' => 'Driver not found'], 404);
        }

        if ($driver->status !== 'approved') {
            return response()->json(['error' => 'Driver must be approved before going online'], 403);
        }

        $driver->update(['is_online' => (bool)$request->isOnline]);

        return response()->json($this->enrichDriver($driver));
    }

    public function approve($id)
    {
        $driver = Driver::find($id);

        if (!$driver) {
            return response()->json(['error' => 'Driver not found'], 404);
        }

        $driver->update([
            'status' => 'approved',
            'rejection_reason' => null
        ]);

        return response()->json($this->enrichDriver($driver));
    }

    public function reject(Request $request, $id)
    {
        $driver = Driver::find($id);

        if (!$driver) {
            return response()->json(['error' => 'Driver not found'], 404);
        }

        $driver->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason
        ]);

        return response()->json($this->enrichDriver($driver));
    }

    public function suspend($id)
    {
        $driver = Driver::find($id);

        if (!$driver) {
            return response()->json(['error' => 'Driver not found'], 404);
        }

        $driver->update([
            'status' => 'suspended',
            'is_online' => false
        ]);

        return response()->json($this->enrichDriver($driver));
    }

    public function dashboard(Request $request)
    {
        $user = $request->user();
        $driver = Driver::where('user_id', $user->id)->first();

        if (!$driver) {
            return response()->json(['error' => 'Driver profile not found'], 404);
        }

        $recentTrips = \App\Models\Booking::where('driver_id', $driver->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();
            
        $pendingRequests = [];
        if ($driver->is_online && $driver->status === 'approved') {
            $pendingRequests = \App\Models\Booking::with('student')
                ->where('status', 'searching')
                ->orderBy('created_at', 'desc')
                ->get();
        }

        $todayStart = now()->startOfDay();
        $todayEarnings = \App\Models\Booking::where('driver_id', $driver->id)
            ->where('status', 'completed')
            ->where('created_at', '>=', $todayStart)
            ->sum('fare_estimate');
            
        $todayTrips = \App\Models\Booking::where('driver_id', $driver->id)
            ->where('status', 'completed')
            ->where('created_at', '>=', $todayStart)
            ->count();

        return response()->json([
            'isOnline' => (bool) $driver->is_online,
            'rating' => (float) $driver->rating,
            'totalTrips' => (int) $driver->total_rides,
            'todayEarnings' => (float) $todayEarnings,
            'todayTrips' => (int) $todayTrips,
            'recentTrips' => $recentTrips->map(fn($b) => [
                'id' => $b->id,
                'status' => $b->status,
                'pickupLocation' => $b->pickup_location,
                'destination' => $b->destination,
                'fareEstimate' => $b->fare_estimate,
                'student' => $b->student ? ['name' => $b->student->name] : null
            ]),
            'pendingRequests' => collect($pendingRequests)->map(fn($b) => [
                'id' => $b->id,
                'pickupLocation' => $b->pickup_location,
                'destination' => $b->destination,
                'fareEstimate' => $b->fare_estimate,
                'student' => $b->student ? ['name' => $b->student->name, 'studentId' => $b->student->student_id] : null
            ]),
            // Fields for the mobile app compatibility
            'user' => ['name' => $user->name],
            'driver' => ['is_online' => (bool) $driver->is_online],
            'available_bookings' => $pendingRequests
        ]);
    }

    public function toggleStatus(Request $request)
    {
        $user = $request->user();
        $driver = Driver::where('user_id', $user->id)->first();

        if (!$driver) {
            return response()->json(['error' => 'Driver profile not found'], 404);
        }

        if ($driver->status !== 'approved') {
            return response()->json(['error' => 'Driver must be approved before going online'], 403);
        }

        $driver->update(['is_online' => (bool)$request->isOnline]);

        return response()->json($this->enrichDriver($driver));
    }
}
