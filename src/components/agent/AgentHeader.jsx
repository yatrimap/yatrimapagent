"use client";

import { useState } from 'react';
import { useAgent } from '@/context/AgentContext';
import { useRouter } from 'next/navigation';
import { 
  Bell, 
  Menu, 
  User, 
  LogOut, 
  Settings, 
  HelpCircle,
  Wallet,
  ChevronDown,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export function AgentHeader() {
  const { agent: agentData, logout } = useAgent();
  
  // Extract nested data from API response
  const agent = agentData?.agent || {};
  const wallet = agentData?.wallet || {};
  const router = useRouter();
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Booking!',
      message: 'You earned ₹450 commission from River Rafting booking',
      time: '2 mins ago',
      type: 'success',
      read: false
    },
    {
      id: 2,
      title: 'Pooling Alert',
      message: 'Urgent: Bungee Jumping needs 2 more members - ₹350/person',
      time: '15 mins ago',
      type: 'urgent',
      read: false
    },
    {
      id: 3,
      title: 'Commission Approved',
      message: 'Your pending commission of ₹1,200 has been approved',
      time: '1 hour ago',
      type: 'info',
      read: true
    }
  ]);

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '💰';
      case 'urgent': return '⚡';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-orange-100 lg:rounded-b-3xl lg:mx-4 lg:mt-2 lg:shadow-lg">
      <div className="flex items-center justify-between h-20 px-4 lg:px-8">
        {/* Left Side - Mobile Menu & Location */}
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="lg:hidden h-12 w-12 rounded-xl hover:bg-orange-50"
              >
                <Menu className="h-6 w-6 text-slate-600" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              {/* Mobile sidebar content - reuse your AgentSidebar component here */}
              <div className="p-6 bg-gradient-to-br from-orange-500 to-amber-600 text-white">
                <h2 className="text-2xl font-bold">YatriMap</h2>
                <p className="text-white/80">Agent Portal</p>
              </div>
            </SheetContent>
          </Sheet>

          {/* Location Badge - Desktop */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 rounded-full font-medium">
            <MapPin className="w-4 h-4" />
            <span>{agent?.city || 'Rishikesh'}, {agent?.state || 'Uttarakhand'}</span>
          </div>
        </div>

        {/* Center - Search Bar (Desktop) */}
        <div className="hidden lg:block flex-1 max-w-xl mx-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search bookings, commissions..."
              className="w-full h-12 pl-12 pr-4 bg-slate-50 border-2 border-transparent focus:border-orange-300 rounded-2xl text-lg transition-all outline-none"
            />
            <svg 
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Right Side - Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative h-12 w-12 rounded-xl hover:bg-orange-50"
              >
                <Bell className="h-6 w-6 text-slate-600" />
                <AnimatePresence>
                  {unreadCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute top-2 right-2 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                      {unreadCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96 p-0">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-amber-50">
                <h3 className="font-bold text-lg text-slate-900">Notifications</h3>
                <Button variant="ghost" size="sm" className="text-orange-600">
                  Mark all read
                </Button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${
                      !notification.read ? 'bg-orange-50/30' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-slate-900">{notification.title}</h4>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-orange-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mb-1">{notification.message}</p>
                        <p className="text-xs text-slate-400">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Notification footer removed as it is unimplemented */}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Wallet Quick View */}
          <Link href="/dashboard/wallet" className="hidden sm:block">
            <Button 
              variant="ghost" 
              className="h-12 px-4 rounded-xl hover:bg-green-50"
            >
              <Wallet className="h-5 w-5 mr-2 text-green-600" />
              <span className="font-bold text-slate-900">₹{wallet?.withdrawableAmount?.toLocaleString() || wallet?.balance?.toLocaleString() || '0'}</span>
            </Button>
          </Link>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="h-12 px-2 rounded-xl hover:bg-slate-50 flex items-center gap-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {agent?.fullName?.charAt(0) || 'A'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-slate-900 leading-tight">{agent?.fullName?.split(' ')[0]}</p>
                  <p className="text-xs text-slate-500">Agent</p>
                </div>
                <ChevronDown className="hidden md:block w-4 h-4 text-slate-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {agent?.fullName?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{agent?.fullName}</p>
                    <p className="text-xs text-slate-500">{agent?.email}</p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="h-12 px-4 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                onClick={logout}
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span className="font-medium">Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Location Bar */}
      <div className="lg:hidden px-4 pb-3 flex items-center gap-2 text-sm text-slate-600">
        <MapPin className="w-4 h-4 text-orange-500" />
        <span>{agent?.city || 'Rishikesh'}, {agent?.state || 'Uttarakhand'}</span>
      </div>
    </header>
  );
}