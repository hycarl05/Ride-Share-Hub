<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Driver extends Model
{
    protected $fillable = [
        'user_id',
        'ic_number',
        'license_number',
        'vehicle_type',
        'vehicle_plate',
        'profile_photo',
        'vehicle_photo',
        'status',
        'is_online',
        'rating',
        'total_rides',
        'rejection_reason',
    ];

    protected $casts = [
        'is_online' => 'boolean',
        'rating' => 'float',
        'total_rides' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }
}
