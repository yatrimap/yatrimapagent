"use client";

import { useEffect, useState } from 'react';
import { useAgent } from '@/context/AgentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Users,
  ShoppingBag,
  QrCode,
  Wallet,
  ArrowRight,
  Clock,
  Hotel,
  Car,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  TrendingUp,
  MapPin,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function AgentDashboard() {
  const { agent: agentData } = useAgent();
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
    hotel: <Hotel className="w-5 h-5" />,
    rental: <Car className="w-5 h-5" />,
    activity: <Target className="w-5 h-5" />,
  };

  const serviceColors = {
    hotel: "bg-blue-50 text-blue-600 border-blue-200",
    rental: "bg-emerald-50 text-emerald-600 border-emerald-200",
    activity: "bg-orange-50 text-orange-600 border-orange-200"
  };

  const stats = [
    {
      title: "Total Earnings",
      value: formatCurrency(overview?.commissionSummary?.totalEarned || overview?.wallet?.lifetimeEarnings || 0),
      icon: <DollarSign className="w-6 h-6" />,
      color: "from-emerald-500 to-teal-600",
      shadow: "shadow-emerald-500/20",
      change: overview?.monthlyGrowth || 0,
      changeLabel: "vs last month"
    },
    {
      title: "Pending Commission",
      value: formatCurrency(overview?.commissionSummary?.totalPending || overview?.wallet?.pendingAmount || 0),
      icon: <Clock className="w-6 h-6" />,
      color: "from-amber-400 to-orange-500",
      shadow: "shadow-orange-500/20",
      change: null,
      changeLabel: "awaiting approval"
    },
    {
      title: "Total Bookings",
      value: overview?.totalBookings || overview?.performance?.totalBookings || 0,
      icon: <ShoppingBag className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/20",
      change: null,
      changeLabel: "all time"
    },
    {
      title: "Total Customers",
      value: overview?.totalCustomers || 0,
      icon: <Users className="w-6 h-6" />,
      color: "from-purple-500 to-fuchsia-600",
      shadow: "shadow-purple-500/20",
      change: null,
      changeLabel: "unique customers"
    }
  ];

  const quickActions = [
    { label: "My QR Code", description: "Share and earn", href: "/dashboard/qr", icon: <QrCode className="w-6 h-6" />, color: "bg-orange-100 text-orange-600" },
    { label: "Bookings", description: "View history", href: "/dashboard/bookings", icon: <ShoppingBag className="w-6 h-6" />, color: "bg-blue-100 text-blue-600" },
    { label: "Wallet", description: "Manage funds", href: "/dashboard/wallet", icon: <Wallet className="w-6 h-6" />, color: "bg-emerald-100 text-emerald-600" },
    { label: "Analytics", description: "Performance data", href: "/dashboard/analytics", icon: <BarChart3 className="w-6 h-6" />, color: "bg-purple-100 text-purple-600" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative flex items-center justify-center w-20 h-20">
          <div className="absolute inset-0 border-4 border-orange-200 rounded-full animate-ping opacity-75"></div>
          <div className="relative w-12 h-12 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-6 lg:pt-0 max-w-7xl mx-auto pb-12">

      {/* Live Status Bar - Redesigned as a floating banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm rounded-2xl gap-4"
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">QR Code is Live</p>
            <p className="text-xs text-slate-500">Ready to accept bookings</p>
          </div>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
          <Wallet className="w-4 h-4 text-slate-400" />
          <div className="flex flex-col items-end sm:items-start">
            <p className="text-xs text-slate-500 font-medium">Withdrawable Balance</p>
            <p className="font-bold text-emerald-600">{formatCurrency(overview?.wallet?.withdrawableAmount || 0)}</p>
          </div>
          <Link href="/dashboard/wallet" className="ml-2">
            <Button size="sm" className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs h-8">
              Withdraw
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Hero Welcome Section - Modern Glassmorphism */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-black z-0" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 z-0" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 z-0" />

        <div className="relative z-10 p-8 lg:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-white space-y-4 max-w-2xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-orange-300 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Agent Partner
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
              Welcome back, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200">
                {agent?.fullName?.split(' ')[0] || "Agent"}
              </span> 👋
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
              Track your earnings, manage your pooling network, and grow your travel business with YatriMap.
            </p>
          </div>

          <div className="flex-shrink-0 bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-2xl flex flex-col items-center justify-center min-w-[280px]">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30 mb-4">
              <QrCode className="w-8 h-8 text-white" />
            </div>
            <p className="text-white font-medium mb-1">Your Agent ID</p>
            <p className="text-2xl font-mono font-bold text-orange-300 mb-6">{agent?.agentId}</p>
            <Link href="/dashboard/qr" className="w-full">
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold h-12 rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                Share QR Code
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid - Floating Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i}
          >
            <Card className="border-0 shadow-sm hover:shadow-xl transition-all duration-500 bg-white group rounded-2xl overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-150`} />
              <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} ${stat.shadow} text-white flex items-center justify-center shadow-lg group-hover:-translate-y-1 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  {stat.change !== null && stat.change !== 0 && (
                    <Badge className={stat.change > 0 ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0" : "bg-rose-50 text-rose-700 hover:bg-rose-100 border-0"}>
                      {stat.change > 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                      {Math.abs(stat.change)}%
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold tracking-tight text-slate-900 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-slate-900 group-hover:to-slate-600 transition-colors">
                  {stat.value}
                </p>
                {stat.changeLabel && <p className="text-xs text-slate-400 mt-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {stat.changeLabel}</p>}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="">

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Recent Activity</h2>
            <Link href="/dashboard/bookings">
              <Button variant="ghost" className="text-sm font-semibold text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-full px-4">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <Card className="border-0 shadow-sm rounded-3xl overflow-hidden bg-white">
            <CardContent className="p-0">
              {overview?.recentBookings && overview.recentBookings.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {overview.recentBookings.map((booking, i) => (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.1 }}
                      key={i}
                      className="flex items-center p-6 hover:bg-slate-50/50 transition-colors group"
                    >
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${serviceColors[booking.type] || "bg-slate-50 text-slate-600 border-slate-200"}`}>
                        {serviceIcons[booking.type] || <ShoppingBag className="w-5 h-5" />}
                      </div>

                      <div className="flex-1 min-w-0 ml-4">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-slate-900 truncate">{booking.serviceName}</p>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider text-slate-500 border-slate-200">
                            {booking.type}
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-slate-500 gap-2">
                          <span className="font-medium text-slate-700">{booking.customerName}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <span>{new Date(booking.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className="text-right pl-4">
                        <p className="font-bold text-slate-900 text-lg">{formatCurrency(booking.amount)}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <Sparkles className="w-3 h-3 text-emerald-500" />
                          <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide">
                            Earned {formatCurrency(booking.commission)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 px-6">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings yet</h3>
                  <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                    Share your QR code with customers or direct them to your custom link to start earning commissions.
                  </p>
                  <Link href="/dashboard/qr">
                    <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12 px-8 font-bold shadow-lg shadow-orange-500/30">
                      <QrCode className="w-5 h-5 mr-2" />
                      View My QR Code
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}