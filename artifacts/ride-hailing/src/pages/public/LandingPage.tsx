import { ShieldCheck, MapPin, Clock, CreditCard, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const { isAuthenticated, role } = useAuth();

  const getDashboardLink = () => {
    if (!isAuthenticated) return '/login';
    if (role === 'student') return '/student/dashboard';
    if (role === 'driver') return '/driver/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/login';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <header className="px-6 py-4 flex items-center justify-between bg-white border-b border-border sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="w-8 h-8" />
          <span className="text-xl font-bold tracking-tight">Prebet UPSI</span>
        </div>
        <nav className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link href={getDashboardLink()} className="font-medium text-sm text-foreground hover:text-primary transition-colors">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="font-medium text-sm text-foreground hover:text-primary transition-colors">
                Log in
              </Link>
              <Button asChild className="rounded-full hidden sm:inline-flex">
                <Link href="/register">Sign up</Link>
              </Button>
            </>
          )}
        </nav>
      </header>

      <main className="flex-1">
        <section className="px-6 py-20 sm:py-32 flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-primary text-sm font-medium mb-6">
            <ShieldCheck className="w-4 h-4" /> Trusted campus rides
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Safe, reliable rides for <span className="text-primary">UPSI</span> students.
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl">
            A verified, secure alternative to Telegram bookings. Travel around campus and Tanjong Malim with peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" asChild className="rounded-full text-md h-14 px-8">
              <Link href="/register">Get Started as Student</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full text-md h-14 px-8 bg-white">
              <Link href="/driver/register">Apply to Drive</Link>
            </Button>
          </div>
        </section>

        <section className="bg-white py-20 px-6 border-t border-border">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Why Prebet UPSI?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4 text-primary">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Verified Drivers</h3>
                <p className="text-muted-foreground">Every driver goes through admin approval with IC and student/license verification.</p>
              </div>
              <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4 text-primary">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Real-time Tracking</h3>
                <p className="text-muted-foreground">Know exactly when your ride will arrive with live status updates.</p>
              </div>
              <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-4 text-primary">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">Clear Pricing</h3>
                <p className="text-muted-foreground">Get fare estimates before you book. No surprises or unfair haggling.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 py-12 px-6 text-slate-400 border-t border-slate-800">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 text-slate-200">
            <ShieldCheck className="w-6 h-6" />
            <span className="text-lg font-bold">Prebet UPSI</span>
          </div>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} Prebet UPSI. A trusted campus transport platform.
          </div>
        </div>
      </footer>
    </div>
  );
}
