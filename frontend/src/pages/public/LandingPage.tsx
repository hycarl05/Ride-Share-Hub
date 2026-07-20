import { useState } from 'react';
import { ShieldCheck, Clock, CreditCard, UserCircle, Car, Shield, X, Sun, Moon } from 'lucide-react';
import { Link } from 'wouter';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/theme-provider';
import { useLogin } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import DiagonalCarousel from '@/components/ui/DiagonalCarousel';
import logoUpsi from '@/assets/logo_upsi.jpg';

// ── Login Modal (always dark — floats over backdrop) ─────────────────────────

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const ROLES = [
  { value: 'student', label: 'Student', icon: UserCircle },
  { value: 'driver',  label: 'Driver',  icon: Car },
  { value: 'admin',   label: 'Admin',   icon: Shield },
] as const;

function LoginModal({ onClose }: { onClose: () => void }) {
  const [role, setRole] = useState<'student' | 'driver' | 'admin'>('student');
  const loginMutation = useLogin();
  const { login } = useAuth();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: (res) => {
        onClose();
        login(res.user, res.token);
        toast({ title: 'Welcome back!', description: `Logged in as ${res.user.name}` });
      },
      onError: (err: any) => {
        toast({
          title: 'Login failed',
          description: err.message || 'Invalid email or password',
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'linear-gradient(145deg, #0e1829 0%, #0a1220 100%)', border: '1px solid rgba(59,175,218,0.15)' }}>

        <button onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors z-10">
          <X className="w-5 h-5" />
        </button>

        <div className="px-8 pt-8 pb-6 text-center border-b border-white/5">
          <div className="flex items-center justify-center gap-2 mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z"
                fill="#3BAFDA" opacity="0.2" stroke="#3BAFDA" strokeWidth="1.5" />
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-white font-bold">Prebet UPSI</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm">Choose your role to continue</p>
        </div>

        <div className="px-8 py-6">
          <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5">
            {ROLES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setRole(value)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  role === value
                    ? 'bg-[#3bafda] text-white shadow-md shadow-[#3bafda]/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-sm">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={`email@${role === 'student' ? 'student.upsi.edu.my' : role === 'admin' ? 'upsi.edu.my' : 'example.com'}`}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-600
                        focus-visible:ring-[#3bafda]/50 focus-visible:border-[#3bafda]/40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300 text-sm">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-600
                        focus-visible:ring-[#3bafda]/50 focus-visible:border-[#3bafda]/40"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-400 text-xs" />
                </FormItem>
              )} />

              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full h-11 bg-[#3bafda] hover:bg-[#2d9cc7] text-white font-bold rounded-xl mt-2 transition-colors"
              >
                {loginMutation.isPending
                  ? 'Logging in…'
                  : `Log in as ${role.charAt(0).toUpperCase() + role.slice(1)}`}
              </Button>
            </form>
          </Form>

          <div className="mt-5 text-center text-sm text-slate-500">
            {role === 'student' && (
              <>New student?{' '}
                <Link href="/register" onClick={onClose}
                  className="text-[#3bafda] hover:text-white font-medium transition-colors">
                  Register here
                </Link>
              </>
            )}
            {role === 'driver' && (
              <>Want to drive?{' '}
                <Link href="/driver/register" onClick={onClose}
                  className="text-[#3bafda] hover:text-white font-medium transition-colors">
                  Apply here
                </Link>
              </>
            )}
            {role === 'admin' && (
              <span className="text-slate-600 text-xs">Admin access is managed by UPSI IT.</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Landing Page ─────────────────────────────────────────────────────────────

const CAROUSEL_ITEMS = [
  { src: logoUpsi, title: 'UPSI Campus', alt: 'UPSI Logo' },
  { src: logoUpsi, title: 'Safe Rides', alt: 'UPSI Logo 2' },
  { src: logoUpsi, title: 'Student Community', alt: 'UPSI Logo 3' },
];

export default function LandingPage() {
  const { isAuthenticated, role } = useAuth();
  const { theme, setTheme } = useTheme();
  const [showLogin, setShowLogin] = useState(false);

  const isDark = theme === 'dark';

  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  const getDashboardLink = () => {
    if (role === 'student') return '/student/dashboard';
    if (role === 'driver')  return '/driver/dashboard';
    if (role === 'admin')   return '/admin/dashboard';
    return '/';
  };

  // ── Colour tokens ──────────────────────────────────────────────────────────
  const c = {
    pageBg:      isDark ? 'linear-gradient(135deg,#07090f 0%,#0c1422 50%,#07090f 100%)'
                        : 'linear-gradient(135deg,#f8fafc 0%,#eef2f7 50%,#f8fafc 100%)',
    sectionAlt:  isDark ? '#0a0f1e' : '#f1f5f9',
    sectionMain: isDark ? '#07090f' : '#ffffff',
    border:      isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)',

    logo:        isDark ? 'text-white' : 'text-slate-900',
    navLink:     isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900',
    navDash:     isDark ? 'text-[#3bafda] hover:text-white' : 'text-[#0F4C81] hover:text-[#3bafda]',
    signupBtn:   isDark
      ? 'border-[#3bafda]/40 text-[#3bafda] hover:bg-[#3bafda] hover:text-white'
      : 'border-[#0F4C81]/40 text-[#0F4C81] hover:bg-[#0F4C81] hover:text-white',
    toggleBtn:   isDark
      ? 'bg-white/8 text-slate-300 hover:bg-white/15 hover:text-white border border-white/10'
      : 'bg-black/5 text-slate-500 hover:bg-black/10 hover:text-slate-900 border border-black/10',

    badge:       isDark ? 'border-white/10 bg-white/5 text-white/50'
                        : 'border-slate-200 bg-slate-100 text-slate-500',
    h1:          isDark ? 'text-white' : 'text-slate-900',
    sub:         isDark ? 'text-slate-400' : 'text-slate-500',
    outlineBtn:  isDark
      ? 'border border-white/15 text-white/70 hover:text-white hover:border-white/30'
      : 'border border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400',

    cardBg:      isDark ? 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.12]'
                        : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm',
    cardTitle:   isDark ? 'text-white' : 'text-slate-900',
    cardBody:    isDark ? 'text-slate-500' : 'text-slate-500',

    stepBorder:  isDark ? 'border-[#3bafda]/30 text-[#3bafda]' : 'border-[#0F4C81]/30 text-[#0F4C81]',
    stepTitle:   isDark ? 'text-white' : 'text-slate-900',
    stepBody:    isDark ? 'text-slate-500' : 'text-slate-500',

    footerBg:    isDark ? '#07090f' : '#f8fafc',
    footerBrand: isDark ? 'text-slate-300' : 'text-slate-700',
    footerMute:  isDark ? 'text-slate-600' : 'text-slate-400',
    footerPath:  isDark ? 'white' : '#1e293b',

    accentPrimary: isDark ? '#3bafda' : '#0F4C81',
    accentHover:   isDark ? '#2d9cc7' : '#1a5fa0',
    iconStroke:    isDark ? '#3BAFDA' : '#0F4C81',
    checkStroke:   isDark ? '#3BAFDA' : '#0F4C81',
  };

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden transition-colors duration-300"
      style={{ background: c.pageBg }}>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      {/* ── Navbar ── */}
      <header className="relative z-30 px-8 py-5 flex items-center justify-between">
        <div className={`flex items-center gap-2 ${c.logo}`}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z"
              fill={c.iconStroke} fillOpacity="0.15" stroke={c.iconStroke} strokeWidth="1.5" />
            <path d="M9 12l2 2 4-4" stroke={c.checkStroke} strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-lg font-bold tracking-tight">Prebet UPSI</span>
        </div>

        <nav className="flex items-center gap-3">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${c.toggleBtn}`}
          >
            {isDark
              ? <Sun className="w-4 h-4" />
              : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <Link href={getDashboardLink()}
              className={`text-sm font-semibold transition-colors ${c.navDash}`}>
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <button onClick={() => setShowLogin(true)}
                className={`text-sm transition-colors font-medium ${c.navLink}`}>
                Log in
              </button>
              <Link href="/register"
                className={`text-sm border font-semibold px-5 py-2 rounded-full transition-all ${c.signupBtn}`}>
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-28 sm:py-36">
        <div className="mb-8">
          <svg width="56" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z"
              fill={c.iconStroke} fillOpacity={isDark ? '0.12' : '0.10'} stroke={c.iconStroke} strokeWidth="1.5" />
            <path d="M9 12l2 2 4-4" stroke={c.checkStroke} strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border
          text-xs font-medium mb-6 tracking-widest uppercase ${c.badge}`}>
          Verified · Secure · On-campus
        </div>

        <h1 className={`text-5xl sm:text-6xl font-extrabold mb-5 leading-tight tracking-tight ${c.h1}`}>
          Your safety,<br />
          <span style={{
            backgroundImage: isDark
              ? 'linear-gradient(90deg,#3bafda,#5fd4f5)'
              : 'linear-gradient(90deg,#0F4C81,#3bafda)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            guaranteed.
          </span>
        </h1>

        <p className={`text-base mb-10 max-w-sm leading-relaxed ${c.sub}`}>
          Every driver verified. Every ride tracked. UPSI students travel with confidence.
        </p>

        <div className="flex gap-3 justify-center">
          {isAuthenticated ? (
            role === 'student' ? (
              <>
                <Link href="/student/book"
                  style={{ background: c.accentPrimary }}
                  className="text-white font-bold px-7 py-3 rounded-full text-sm transition-colors
                    hover:opacity-90 shadow-lg">
                  Book a Ride
                </Link>
                <Link href="/student/rides"
                  className={`font-semibold px-7 py-3 rounded-full text-sm transition-colors ${c.outlineBtn}`}>
                  My Rides
                </Link>
              </>
            ) : (
              <Link href={getDashboardLink()}
                style={{ background: c.accentPrimary }}
                className="text-white font-bold px-7 py-3 rounded-full text-sm transition-colors hover:opacity-90 shadow-lg">
                Go to Dashboard
              </Link>
            )
          ) : (
            <>
              <button onClick={() => setShowLogin(true)}
                style={{ background: c.accentPrimary }}
                className="text-white font-bold px-7 py-3 rounded-full text-sm transition-colors hover:opacity-90 shadow-lg">
                Log In
              </button>
              <Link href="/driver/register"
                className={`font-semibold px-7 py-3 rounded-full text-sm transition-colors ${c.outlineBtn}`}>
                Apply to Drive
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ── Carousel Section ── */}
      <section className="h-[500px] w-full max-w-6xl mx-auto mb-20 relative px-6">
        <DiagonalCarousel items={CAROUSEL_ITEMS} />
      </section>

      {/* ── Why Prebet UPSI ── */}
      <section className="py-20 px-6 transition-colors duration-300"
        style={{ background: c.sectionAlt, borderTop: `1px solid ${c.border}` }}>
        <div className="max-w-5xl mx-auto">
          <h2 className={`text-3xl font-bold text-center mb-3 ${c.h1}`}>Why Prebet UPSI?</h2>
          <p className={`text-center mb-12 text-sm ${c.sub}`}>Built for UPSI students. Trusted by campus.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <ShieldCheck className="w-5 h-5" />,
                title: 'Verified Drivers',
                body: 'Every driver goes through admin approval with IC and license verification before their first ride.',
              },
              {
                icon: <Clock className="w-5 h-5" />,
                title: 'Real-time Status',
                body: 'Know exactly when your ride will arrive with live status updates — Searching, Arriving, In Progress.',
              },
              {
                icon: <CreditCard className="w-5 h-5" />,
                title: 'Transparent Fares',
                body: 'Get fare estimates before you book. Campus-calibrated pricing — no surprises, no haggling.',
              },
            ].map(({ icon, title, body }) => (
              <div key={title}
                className={`p-6 rounded-2xl border transition-colors ${c.cardBg}`}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${c.accentPrimary}18`, color: c.accentPrimary }}>
                  {icon}
                </div>
                <h3 className={`font-bold text-lg mb-2 ${c.cardTitle}`}>{title}</h3>
                <p className={`text-sm leading-relaxed ${c.cardBody}`}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 px-6 transition-colors duration-300"
        style={{ background: c.sectionMain, borderTop: `1px solid ${c.border}` }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`text-3xl font-bold mb-3 ${c.h1}`}>Book in 3 steps</h2>
          <p className={`text-sm mb-12 ${c.sub}`}>No calls. No Telegram groups. Just tap.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', label: 'Register',    desc: 'Sign up with your UPSI student email and verify your account.' },
              { step: '02', label: 'Book a Ride', desc: 'Choose your pickup and destination. See the fare before you confirm.' },
              { step: '03', label: 'Ride Safe',   desc: 'Track your driver live. Rate your trip when you arrive.' },
            ].map(({ step, label, desc }) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full border flex items-center justify-center
                  text-xs font-bold tracking-widest mb-4 ${c.stepBorder}`}>
                  {step}
                </div>
                <h3 className={`font-bold mb-2 ${c.stepTitle}`}>{label}</h3>
                <p className={`text-sm leading-relaxed ${c.stepBody}`}>{desc}</p>
              </div>
            ))}
          </div>
          {!isAuthenticated && (
            <div className="mt-12 flex gap-3 justify-center">
              <Link href="/register"
                style={{ background: c.accentPrimary }}
                className="text-white font-bold px-7 py-3 rounded-full text-sm transition-colors hover:opacity-90 shadow-lg">
                Register as Student
              </Link>
              <button onClick={() => setShowLogin(true)}
                className={`font-semibold px-7 py-3 rounded-full text-sm transition-colors ${c.outlineBtn}`}>
                Already have an account?
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6 transition-colors duration-300"
        style={{ background: c.footerBg, borderTop: `1px solid ${c.border}` }}>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className={`flex items-center gap-2 ${c.footerBrand}`}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z"
                fill={c.iconStroke} fillOpacity="0.15" stroke={c.iconStroke} strokeWidth="1.5" />
              <path d="M9 12l2 2 4-4" stroke={c.footerPath} strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-semibold text-sm">Prebet UPSI</span>
          </div>
          <p className={`text-xs ${c.footerMute}`}>
            &copy; {new Date().getFullYear()} Prebet UPSI — Trusted campus transport, Tanjong Malim.
          </p>
        </div>
      </footer>
    </div>
  );
}
