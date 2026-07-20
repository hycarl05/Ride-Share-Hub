<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class DriverSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'driver@upsi.edu.my'],
            [
                'name' => 'Driver Test',
                'password' => Hash::make('driver123'),
                'phone' => '0101234567',
                'role' => 'driver',
            ]
        );

        \App\Models\Driver::firstOrCreate(
            ['user_id' => $user->id],
            [
                'ic_number' => '010203101234',
                'license_number' => '12345678',
                'vehicle_type' => 'Perodua Myvi',
                'vehicle_plate' => 'ABC 1234',
                'status' => 'approved',
                'is_online' => false,
                'rating' => 5.0,
                'total_rides' => 0,
            ]
        );
    }
}
