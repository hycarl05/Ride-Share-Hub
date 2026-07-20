<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@upsi.edu.my'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('admin123'),
                'phone' => '0000000000',
                'role' => 'admin',
            ]
        );
    }
}
