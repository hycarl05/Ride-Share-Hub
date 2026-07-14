import { ShieldCheck, Clock, CreditCard } from 'lucide-react';
import { Link } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldScene } from '@/components/ShieldScene';

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
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden"
      style={{ background: 'linear-gradient(135deg, #07090f 0%, #0c1422 50%, #07090f 100%)' }}>

      {/* ── Navbar ── */}
      <header className="relative z-30 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z"
              fill="#3BAFDA" opacity="0.2" stroke="#3BAFDA" strokeWidth="1.5" />
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.8"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-lg font-bold tracking-tight">Prebet UPSI</span>
        </div>
        <nav className="flex items-center gap-6">
          {isAuthenticated ? (
            <Link href={getDashboardLink()}
              className="text-sm text-[#3bafda] font-semibold hover:text-white transition-colors">
              Go to Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login"
                className="text-sm text-slate-400 hover:text-white transition-colors font-medium">
                Log in
              </Link>
              <Link href="/register"
                className="text-sm border border-[#3bafda]/40 text-[#3bafda] font-semibold
                  px-5 py-2 rounded-full hover:bg-[#3bafda] hover:text-white transition-all">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* ── Hero — 3D Shield fills the viewport ── */}
      <section className="relative flex-1 min-h-[85vh] flex flex-col">
        {/* 3D canvas — absolute, fills hero */}
        <div className="absolute inset-0 z-0">
          <ShieldScene />
        </div>

        {/* Top gradient fade (keeps nav readable) */}
        <div className="absolute top-0 left-0 right-0 h-24
          bg-gradient-to-b from-[#07090f] to-transparent z-10 pointer-events-none" />

        {/* Hero text — sits in front of 3D, pushed to bottom */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-end
          text-center px-6 pb-16 pointer-events-none">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            border border-white/10 bg-white/5 text-white/60
            text-xs font-medium mb-5 tracking-widest uppercase pointer-events-auto">
            Verified · Secure · On-campus
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-4 leading-tight">
            Your safety,<br />
            <span className="bg-gradient-to-r from-[#3bafda] to-[#5fd4f5]
              bg-clip-text text-transparent">
              guaranteed.
            </span>
          </h1>
          <p className="text-slate-400 text-base mb-8 max-w-sm leading-relaxed">
            Every driver verified. Every ride tracked. UPSI students travel with confidence.
          </p>
          <div className="flex gap-3 justify-center pointer-events-auto">
            {/* Primary CTA — varies by role */}
            {role === 'student' ? (
              <Link href="/student/book"
                className="bg-white text-[#07090f] font-bold px-7 py-3 rounded-full
                  text-sm hover:bg-slate-100 transition-colors shadow-lg shadow-black/40">
                Book a Ride
              </Link>
            ) : role === 'driver' ? (
              <Link href="/driver/dashboard"
                className="bg-white text-[#07090f] font-bold px-7 py-3 rounded-full
                  text-sm hover:bg-slate-100 transition-colors shadow-lg shadow-black/40">
                Driver Dashboard
              </Link>
            ) : role === 'admin' ? (
              <Link href="/admin/dashboard"
                className="bg-white text-[#07090f] font-bold px-7 py-3 rounded-full
                  text-sm hover:bg-slate-100 transition-colors shadow-lg shadow-black/40">
                Admin Dashboard
              </Link>
            ) : (
              <Link href="/register"
                className="bg-white text-[#07090f] font-bold px-7 py-3 rounded-full
                  text-sm hover:bg-slate-100 transition-colors shadow-lg shadow-black/40">
                Register as Student
              </Link>
            )}

            {/* Secondary CTA */}
            {role === 'student' ? (
              <Link href="/student/rides"
                className="border border-white/15 text-white/70 hover:text-white
                  hover:border-white/30 font-semibold px-7 py-3 rounded-full
                  text-sm transition-colors">
                My Rides
              </Link>
            ) : role === 'driver' || role === 'admin' ? (
              <Link href={getDashboardLink()}
                className="border border-white/15 text-white/70 hover:text-white
                  hover:border-white/30 font-semibold px-7 py-3 rounded-full
                  text-sm transition-colors">
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/driver/register"
                className="border border-white/15 text-white/70 hover:text-white
                  hover:border-white/30 font-semibold px-7 py-3 rounded-full
                  text-sm transition-colors">
                Apply to Drive
              </Link>
            )}
          </div>
        </div>

        {/* Bottom fade into features section */}
        <div className="absolute bottom-0 left-0 right-0 h-32
          bg-gradient-to-t from-[#0a0f1e] to-transparent z-10 pointer-events-none" />
      </section>

      {/* ── Why Prebet UPSI ── */}
      <section className="bg-[#0a0f1e] py-20 px-6 border-t border-white/5 relative z-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-white mb-3">
            Why Prebet UPSI?
          </h2>
          <p className="text-center text-slate-500 mb-12 text-sm">
            Built for UPSI students. Trusted by campus.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <ShieldCheck className="w-5 h-5" />,
                title: 'Verified Drivers',
                body: 'Every driver goes through admin approval with IC and license verification before their first ride.',
                accent: '#3bafda',
              },
              {
                icon: <Clock className="w-5 h-5" />,
                title: 'Real-time Status',
                body: 'Know exactly when your ride will arrive with live status updates — Searching, Arriving, In Progress.',
                accent: '#5fd4f5',
              },
              {
                icon: <CreditCard className="w-5 h-5" />,
                title: 'Transparent Fares',
                body: 'Get fare estimates before you book. Campus-calibrated pricing — no surprises, no haggling.',
                accent: '#3bafda',
              },
            ].map(({ icon, title, body, accent }) => (
              <div key={title}
                className="p-6 rounded-2xl bg-white/3 border border-white/6
                  hover:border-white/12 transition-colors group">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${accent}18`, color: accent }}>
                  {icon}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-[#07090f] py-20 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Book in 3 steps</h2>
          <p className="text-slate-500 text-sm mb-12">No calls. No Telegram groups. Just tap.</p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '01', label: 'Register', desc: 'Sign up with your UPSI student ID and verify your account.' },
              { step: '02', label: 'Book a Ride', desc: 'Choose your pickup and destination. See the fare before you confirm.' },
              { step: '03', label: 'Ride Safe', desc: 'Track your driver live. Rate your trip when you arrive.' },
            ].map(({ step, label, desc }) => (
              <div key={step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border border-[#3bafda]/30 flex items-center
                  justify-center text-[#3bafda] text-xs font-bold tracking-widest mb-4">
                  {step}
                </div>
                <h3 className="text-white font-bold mb-2">{label}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#07090f] py-10 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between
          items-center gap-4 text-slate-600">
          <div className="flex items-center gap-2 text-slate-300">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z"
                fill="#3BAFDA" opacity="0.2" stroke="#3BAFDA" strokeWidth="1.5" />
              <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-semibold text-sm">Prebet UPSI</span>
          </div>
          <p className="text-xs">
            &copy; {new Date().getFullYear()} Prebet UPSI — Trusted campus transport, Tanjong Malim.
          </p>
          <div className="text-xs text-slate-800 tracking-widest uppercase">
            Move mouse on hero to tilt shield
          </div>
        </div>
      </footer>
    </div>
  );
}
