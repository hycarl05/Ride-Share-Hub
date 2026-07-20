<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Driver;
use App\Models\Rating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BookingController extends Controller
{
    private function enrichBooking(Booking $booking)
    {
        $booking->load(['student', 'driver.user']);
        
        $student = $booking->student;
        $safeStudent = $student ? [
            'id' => $student->id,
            'name' => $student->name,
            'email' => $student->email,
            'phone' => $student->phone,
            'role' => $student->role,
            'studentId' => $student->student_id,
            'profilePhoto' => $student->profile_photo,
        ] : null;

        $driver = null;
        if ($booking->driver) {
            $d = $booking->driver;
            $driver = [
                'id' => $d->id,
                'userId' => $d->user_id,
                'icNumber' => $d->ic_number,
                'licenseNumber' => $d->license_number,
                'vehicleType' => $d->vehicle_type,
                'vehiclePlate' => $d->vehicle_plate,
                'profilePhoto' => $d->profile_photo,
                'vehiclePhoto' => $d->vehicle_photo,
                'status' => $d->status,
                'isOnline' => $d->is_online,
                'rating' => $d->rating,
                'totalRides' => $d->total_rides,
                'rejectionReason' => $d->rejection_reason,
                'name' => $d->user->name ?? '',
                'email' => $d->user->email ?? '',
                'phone' => $d->user->phone ?? '',
                'studentId' => $d->user->student_id ?? null,
            ];
        }

        $rating = Rating::where('booking_id', $booking->id)->first();

        return [
            'id' => $booking->id,
            'studentId' => $booking->student_id,
            'driverId' => $booking->driver_id,
            'status' => $booking->status,
            'pickupLocation' => $booking->pickup_location,
            'destination' => $booking->destination,
            'notes' => $booking->notes,
            'fareEstimate' => $booking->fare_estimate,
            'estimatedArrival' => $booking->estimated_arrival,
            'createdAt' => $booking->created_at,
            'updatedAt' => $booking->updated_at,
            'student' => $safeStudent,
            'driver' => $driver,
            'rating' => $rating,
        ];
    }

    public function index(Request $request)
    {
        $query = Booking::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        if ($request->has('driverId')) {
            $query->where('driver_id', $request->driverId);
        }
        if ($request->has('studentId')) {
            $query->where('student_id', $request->studentId);
        }

        $bookings = $query->orderBy('created_at', 'desc')->get();

        $enriched = $bookings->map(function ($b) {
            return $this->enrichBooking($b);
        });

        return response()->json($enriched);
    }

    public function studentBookings(Request $request)
    {
        $user = $request->user();
        $bookings = Booking::where('student_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($bookings->map(fn($b) => $this->enrichBooking($b)));
    }

    public function driverBookings(Request $request)
    {
        $user = $request->user();
        $driver = Driver::where('user_id', $user->id)->first();
        if (!$driver) return response()->json([], 403);

        $bookings = Booking::where('driver_id', $driver->id)
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($bookings->map(fn($b) => $this->enrichBooking($b)));
    }

    public function store(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'pickupLocation' => 'required|string',
            'destination' => 'required|string',
            'notes' => 'nullable|string',
            'fareEstimate' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $booking = Booking::create([
            'student_id' => $user->id,
            'pickup_location' => $request->pickupLocation,
            'destination' => $request->destination,
            'notes' => $request->notes,
            'fare_estimate' => $request->fareEstimate ?? 0.0,
            'status' => 'searching',
            'driver_id' => null,
            'estimated_arrival' => null,
        ]);

        return response()->json($this->enrichBooking($booking), 201);
    }

    public function show($id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        return response()->json($this->enrichBooking($booking));
    }

    public function updateStatus(Request $request, $id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        $status = $request->status;
        $allowed = ['arriving', 'in_progress', 'completed'];
        if (!in_array($status, $allowed)) {
            return response()->json(['error' => 'Invalid status transition'], 400);
        }

        $booking->update(['status' => $status]);

        if ($status === 'completed' && $booking->driver_id) {
            $driver = Driver::find($booking->driver_id);
            if ($driver) {
                $driver->increment('total_rides');
            }
        }

        return response()->json($this->enrichBooking($booking));
    }

    public function cancel($id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        $booking->update(['status' => 'cancelled']);

        return response()->json($this->enrichBooking($booking));
    }

    public function accept(Request $request, $id)
    {
        $user = $request->user();
        $driver = Driver::where('user_id', $user->id)->first();

        if (!$driver) {
            return response()->json(['error' => 'Not authorized as a driver'], 403);
        }

        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        $booking->update([
            'status' => 'accepted',
            'driver_id' => $driver->id,
            'estimated_arrival' => now()->addMinutes(10), // mock 10 min arrival
        ]);

        return response()->json($this->enrichBooking($booking));
    }

    public function reject($id)
    {
        $booking = Booking::find($id);

        if (!$booking) {
            return response()->json(['error' => 'Booking not found'], 404);
        }

        // Reset back to searching so another driver can pick it up
        $booking->update([
            'status' => 'searching',
            'driver_id' => null,
        ]);

        return response()->json($this->enrichBooking($booking));
    }
}
