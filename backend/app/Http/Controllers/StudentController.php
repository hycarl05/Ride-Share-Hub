<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Booking;

class StudentController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();

        $activeBooking = Booking::with(['driver.user'])
            ->where('student_id', $user->id)
            ->whereIn('status', ['searching', 'accepted', 'arriving', 'in_progress'])
            ->orderBy('created_at', 'desc')
            ->first();

        $recentBookings = Booking::where('student_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $totalRides = Booking::where('student_id', $user->id)->count();
        
        $completedRides = Booking::where('student_id', $user->id)
            ->where('status', 'completed')
            ->count();

        $totalSpent = Booking::where('student_id', $user->id)
            ->where('status', 'completed')
            ->sum('fare_estimate');

        // We must map it properly for the frontend expected structure
        return response()->json([
            'user' => clone $user,
            'activeBooking' => $activeBooking ? [
                'id' => $activeBooking->id,
                'status' => $activeBooking->status,
                'pickupLocation' => $activeBooking->pickup_location,
                'destination' => $activeBooking->destination,
                'fareEstimate' => $activeBooking->fare_estimate,
            ] : null,
            'recentBookings' => $recentBookings->map(function ($b) {
                return [
                    'id' => $b->id,
                    'status' => $b->status,
                    'pickupLocation' => $b->pickup_location,
                    'destination' => $b->destination,
                    'fareEstimate' => $b->fare_estimate,
                    'createdAt' => $b->created_at,
                ];
            }),
            'totalRides' => $totalRides,
            'completedRides' => $completedRides,
            'totalSpent' => $totalSpent,
        ]);
    }
}
