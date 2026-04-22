"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAgent } from '@/context/AgentContext';
import { 
  LayoutDashboard, 
  Wallet, 
  QrCode, 
  Users, 
  TrendingUp, 
  History,
  LogOut,
  Menu,
  X,
  MapPin,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/qr', label: 'My QR Code', icon: QrCode },
  { href: '/dashboard/bookings', label: 'Bookings', icon: History },
  { href: '/dashboard/commissions', label: 'Commissions', icon: Wallet },
  { href: '/dashboard/pooling', label: 'Live Pooling', icon: Users },
  { href: '/dashboard/analytics', label: 'Analytics', icon: TrendingUp },
];

export function AgentSidebar() {
  const pathname = usePathname();
  const { agent: agentData, logout } = useAgent();
  
  // Extract nested data from API response
  const agent = agentData?.agent || {};
  const wallet = agentData?.wallet || {};
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo Section */}
      <div className="p-6 border-b border-orange-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              YatriMap
            </h1>
            <p className="text-sm text-slate-500 font-medium">Agent Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-4 px-4 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 group",
                isActive 
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200 scale-[1.02]"
                  : "text-slate-600 hover:bg-orange-50 hover:text-orange-600 hover:scale-[1.02]"
              )}
            >
              <Icon className={cn(
                "w-6 h-6 transition-transform group-hover:scale-110",
                isActive && "animate-pulse"
              )} />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Agent Info Card */}
      <div className="p-4 m-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-xl font-bold">
            {agent?.fullName?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate text-lg">{agent?.fullName}</p>
            <p className="text-sm text-slate-400">ID: {agent?.agentId}</p>
          </div>
        </div>
        <div className="pt-3 border-t border-slate-700">
          <p className="text-sm text-slate-400 mb-1">Wallet Balance</p>
          <p className="text-2xl font-bold text-amber-400">₹{wallet?.balance?.toLocaleString() || '0'}</p>
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-orange-100">
        <Button
          variant="outline"
          className="w-full py-6 text-lg font-semibold border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-xl"
          onClick={logout}
        >
          <LogOut className="w-5 h-5 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-slate-800">YatriMap</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-12 w-12">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0 bg-white">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-full w-72 bg-white/80 backdrop-blur-xl border-r border-orange-100 shadow-2xl shadow-orange-100/50 z-40">
        <SidebarContent />
      </aside>
    </>
  );
}