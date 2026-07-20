<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\Rating;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RatingController extends Controller
{
    public function store(Request $request)
    {
        $currentUser = $request->user();

        $validator = Validator::make($request->all(), [
            'bookingId' => 'required|integer',
            'driverId' => 'required|integer',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }

        $rating = Rating::create([
            'booking_id' => $request->bookingId,
            'driver_id' => $request->driverId,
            'student_id' => $currentUser->id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        // Recalculate driver average rating
        $driverId = $request->driverId;
        $allRatings = Rating::where('driver_id', $driverId)->get();
        if ($allRatings->count() > 0) {
            $avg = $allRatings->avg('rating');
            $driver = Driver::find($driverId);
            if ($driver) {
                $driver->update(['rating' => round($avg * 10) / 10]);
            }
        }

        return response()->json([
            'id' => $rating->id,
            'booking_id' => $rating->booking_id,
            'driver_id' => $rating->driver_id,
            'student_id' => $rating->student_id,
            'rating' => $rating->rating,
            'comment' => $rating->comment,
            'created_at' => $rating->created_at,
            'studentName' => $currentUser->name,
        ], 201);
    }

    public function getDriverRatings($driverId)
    {
        $ratings = Rating::where('driver_id', $driverId)->get();

        $enriched = $ratings->map(function ($r) {
            $student = User::find($r->student_id);
            return [
                'id' => $r->id,
                'booking_id' => $r->booking_id,
                'driver_id' => $r->driver_id,
                'student_id' => $r->student_id,
                'rating' => $r->rating,
                'comment' => $r->comment,
                'created_at' => $r->created_at,
                'studentName' => $student ? $student->name : 'Unknown Student',
            ];
        });

        // Sort by newest first
        $enriched = $enriched->sortByDesc('created_at')->values();

        return response()->json($enriched);
    }
}
