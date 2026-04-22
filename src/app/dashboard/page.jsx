"use client";

import { useEffect, useState } from 'react';
import { useAgent } from '@/context/AgentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp,
  DollarSign,
  Users, 
  ShoppingBag,
  Eye,
  QrCode,
  Wallet,
  ArrowRight,
  Clock,
  Hotel,
  Car,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import Link from 'next/link';

export default function AgentDashboard() {
  const { agent: agentData, refreshAgent } = useAgent();
  const agent = agentData?.agent || {};

  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const token = localStorage.getItem('agent_token');
      const res = await fetch(`${baseUrl}/agent-dashboard/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setOverview(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const serviceIcons = {
    hotel: <Hotel className="w-4 h-4" />,
    rental: <Car className="w-4 h-4" />,
    activity: <Target className="w-4 h-4" />,
  };

  const serviceColors = {
    hotel: "bg-blue-100 text-blue-600",
    rental: "bg-green-100 text-green-600",
    activity: "bg-orange-100 text-orange-600"
  };

  const stats = [
    {
      title: "Total Earnings",
      value: formatCurrency(overview?.commissionSummary?.totalEarned || overview?.wallet?.lifetimeEarnings || 0),
      icon: <DollarSign className="w-6 h-6" />,
      color: "from-green-500 to-emerald-600",
      change: overview?.monthlyGrowth || 0,
      changeLabel: "vs last month"
    },
    {
      title: "Pending Commission",
      value: formatCurrency(overview?.commissionSummary?.totalPending || overview?.wallet?.pendingAmount || 0),
      icon: <Clock className="w-6 h-6" />,
      color: "from-amber-500 to-orange-600",
      change: null,
      changeLabel: "awaiting approval"
    },
    {
      title: "Total Bookings",
      value: overview?.totalBookings || overview?.performance?.totalBookings || 0,
      icon: <ShoppingBag className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-600",
      change: null,
      changeLabel: "all time"
    },
    {
      title: "Total Customers",
      value: overview?.totalCustomers || 0,
      icon: <Users className="w-6 h-6" />,
      color: "from-purple-500 to-violet-600",
      change: null,
      changeLabel: "unique customers"
    }
  ];

  const quickActions = [
    { label: "View QR Code", href: "/dashboard/qr", icon: <QrCode className="w-5 h-5" />, color: "bg-orange-100 text-orange-600" },
    { label: "My Bookings", href: "/dashboard/bookings", icon: <ShoppingBag className="w-5 h-5" />, color: "bg-blue-100 text-blue-600" },
    { label: "Wallet", href: "/dashboard/wallet", icon: <Wallet className="w-5 h-5" />, color: "bg-green-100 text-green-600" },
    { label: "Analytics", href: "/dashboard/analytics", icon: <BarChart3 className="w-5 h-5" />, color: "bg-purple-100 text-purple-600" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-12 w-12 border-4 border-orange-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-16 lg:pt-0">
      {/* Welcome */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-8 lg:p-10 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-white/80 text-lg">Welcome Back,</p>
          <h1 className="text-4xl lg:text-5xl font-bold mt-1">{agent?.fullName || "Agent"} 👋</h1>
          <p className="text-white/70 mt-3 text-lg">
            Agent ID: <span className="font-mono bg-white/20 px-2 py-0.5 rounded">{agent?.agentId}</span>
          </p>
          <div className="mt-6">
            <Link href="/dashboard/qr">
              <Button className="bg-white text-orange-600 hover:bg-white/90 text-lg px-6 py-6 rounded-xl font-bold">
                <QrCode className="w-5 h-5 mr-2" />
                Share Your QR Code
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.color} text-white flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  {stat.icon}
                </div>
                {stat.change !== null && stat.change !== 0 && (
                  <Badge className={stat.change > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                    {stat.change > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                    {Math.abs(stat.change)}%
                  </Badge>
                )}
              </div>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.title}</p>
              {stat.changeLabel && <p className="text-xs text-slate-400 mt-1">{stat.changeLabel}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, i) => (
              <Link key={i} href={action.href}>
                <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 transition-all group cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center`}>
                    {action.icon}
                  </div>
                  <span className="font-semibold text-slate-700 flex-1">{action.label}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="border-0 shadow-xl lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold">Recent Bookings</CardTitle>
            <Link href="/dashboard/bookings">
              <Button variant="ghost" className="text-orange-600 hover:text-orange-700">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {overview?.recentBookings && overview.recentBookings.length > 0 ? (
              <div className="space-y-4">
                {overview.recentBookings.map((booking, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${serviceColors[booking.type] || "bg-slate-100 text-slate-600"}`}>
                      {serviceIcons[booking.type] || <ShoppingBag className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{booking.serviceName}</p>
                      <p className="text-sm text-slate-500">
                        {booking.customerName} • {new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatCurrency(booking.amount)}</p>
                      <p className="text-xs text-green-600 font-semibold">+{formatCurrency(booking.commission)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-400">No bookings yet</p>
                <p className="text-slate-400 mt-1">Share your QR code to start earning!</p>
                <Link href="/dashboard/qr">
                  <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                    <QrCode className="w-4 h-4 mr-2" />
                    Get Your QR Code
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Live Status Bar */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-slate-50 to-orange-50">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <div>
            <p className="font-bold text-slate-900">Your QR is Live & Active</p>
            <p className="text-sm text-slate-500">
              Wallet Balance: <span className="font-bold text-green-600">{formatCurrency(overview?.wallet?.withdrawableAmount || 0)}</span>
              {' '} • Withdrawable anytime
            </p>
          </div>
          <Link href="/dashboard/wallet" className="ml-auto">
            <Button variant="outline" className="border-orange-300 text-orange-600">
              <Wallet className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}