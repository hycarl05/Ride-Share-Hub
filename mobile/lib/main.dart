import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'screens/login_screen.dart';
import 'screens/student_dashboard.dart';
import 'screens/driver_dashboard.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final prefs = await SharedPreferences.getInstance();
  final token = prefs.getString('auth_token');
  final role = prefs.getString('user_role');

  Widget initialScreen = const LoginScreen();
  if (token != null && role != null) {
    if (role == 'driver') {
      initialScreen = const DriverDashboard();
    } else {
      initialScreen = const StudentDashboard();
    }
  }

  runApp(RideShareApp(initialScreen: initialScreen));
}

class RideShareApp extends StatelessWidget {
  final Widget initialScreen;

  const RideShareApp({super.key, required this.initialScreen});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Ride Share Hub',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF0F4C81), // Primary brand color
          brightness: Brightness.light,
        ),
        useMaterial3: true,
      ),
      home: initialScreen,
      routes: {
        '/login': (context) => const LoginScreen(),
        '/student_dashboard': (context) => const StudentDashboard(),
        '/driver_dashboard': (context) => const DriverDashboard(),
      },
    );
  }
}
