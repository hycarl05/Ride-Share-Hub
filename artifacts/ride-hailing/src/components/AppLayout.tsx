import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, LayoutDashboard, Car, History, Settings, Users, ShieldCheck, Map, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export function Sidebar() {
  const [location] = useLocation();
  const { user, role, logout } = useAuth();

  const studentLinks = [
    { href: "/student/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard" },
    { href: "/student/book", icon: <Car className="w-5 h-5" />, label: "Book a Ride" },
    { href: "/student/rides", icon: <History className="w-5 h-5" />, label: "My Rides" },
    { href: "/student/settings", icon: <Settings className="w-5 h-5" />, label: "Settings" },
  ];

  const driverLinks = [
    { href: "/driver/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard" },
    { href: "/driver/rides", icon: <Map className="w-5 h-5" />, label: "Trip History" },
    { href: "/driver/settings", icon: <Settings className="w-5 h-5" />, label: "Settings" },
  ];

  const adminLinks = [
    { href: "/admin/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, label: "Overview" },
    { href: "/admin/bookings", icon: <Map className="w-5 h-5" />, label: "Bookings" },
    { href: "/admin/drivers", icon: <Car className="w-5 h-5" />, label: "Drivers" },
    { href: "/admin/students", icon: <Users className="w-5 h-5" />, label: "Students" },
  ];

  let links: SidebarItemProps[] = [];
  if (role === "student") links = studentLinks;
  if (role === "driver") links = driverLinks;
  if (role === "admin") links = adminLinks;

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border hidden md:flex flex-col z-10">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="w-6 h-6" />
          <span className="font-bold text-lg">Prebet UPSI</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1">
        {links.map((link) => {
          const isActive = location === link.href || location.startsWith(link.href + "/");
          return (
            <Link key={link.href} href={link.href} className="w-full">
              <span
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors w-full cursor-pointer",
                  isActive 
                    ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                {link.icon}
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 bg-muted/50 rounded-lg">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{role}</p>
          </div>
        </div>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={logout}>
          <LogOut className="w-4 h-4 mr-2" />
          Log out
        </Button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const [location] = useLocation();
  const { role } = useAuth();

  const links = role === "student" ? [
    { href: "/student/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, label: "Home" },
    { href: "/student/book", icon: <Car className="w-5 h-5" />, label: "Book" },
    { href: "/student/rides", icon: <History className="w-5 h-5" />, label: "Rides" },
    { href: "/student/settings", icon: <Settings className="w-5 h-5" />, label: "Menu" },
  ] : role === "driver" ? [
    { href: "/driver/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, label: "Home" },
    { href: "/driver/rides", icon: <History className="w-5 h-5" />, label: "Trips" },
    { href: "/driver/settings", icon: <Settings className="w-5 h-5" />, label: "Menu" },
  ] : [
    { href: "/admin/dashboard", icon: <LayoutDashboard className="w-5 h-5" />, label: "Overview" },
    { href: "/admin/bookings", icon: <Map className="w-5 h-5" />, label: "Bookings" },
    { href: "/admin/drivers", icon: <Car className="w-5 h-5" />, label: "Drivers" },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex items-center justify-around px-2 py-2 z-50 pb-safe">
      {links.map((link) => {
        const isActive = location === link.href || location.startsWith(link.href + "/");
        return (
          <Link key={link.href} href={link.href} className="flex-1 flex flex-col items-center justify-center py-1">
            <span
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.icon}
              <span className="text-[10px] font-medium">{link.label}</span>
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col md:flex-row font-sans">
      <Sidebar />
      <div className="flex-1 md:pl-64 flex flex-col min-h-[100dvh]">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
