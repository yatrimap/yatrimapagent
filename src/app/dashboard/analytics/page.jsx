"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp,
  BarChart3,
  Users,
  ShoppingBag,
  DollarSign,
  Hotel,
  Car,
  Target,
  ArrowUpRight,
  Loader2
} from 'lucide-react';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('agent_token');
      const res = await fetch(`${baseUrl}/agent-dashboard/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
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

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const serviceIcons = {
    HOTEL: <Hotel className="w-5 h-5" />,
    RENTAL: <Car className="w-5 h-5" />,
    ACTIVITY: <Target className="w-5 h-5" />
  };

  const serviceColors = {
    HOTEL: "from-blue-500 to-indigo-600",
    RENTAL: "from-green-500 to-emerald-600",
    ACTIVITY: "from-orange-500 to-amber-600"
  };

  const serviceBgColors = {
    HOTEL: "bg-blue-100 text-blue-600",
    RENTAL: "bg-green-100 text-green-600",
    ACTIVITY: "bg-orange-100 text-orange-600"
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  const performance = analytics?.performance || {};
  const monthlyEarnings = analytics?.monthlyEarnings || [];
  const serviceStats = analytics?.serviceStats || [];

  // Calculate max for chart
  const maxEarning = Math.max(...monthlyEarnings.map(m => m.total), 1);

  const performanceCards = [
    {
      title: "Total Bookings",
      value: performance.totalBookings || 0,
      icon: <ShoppingBag className="w-6 h-6" />,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Total Customers",
      value: performance.totalCustomers || 0,
      icon: <Users className="w-6 h-6" />,
      color: "from-purple-500 to-violet-600"
    },
    {
      title: "Avg Commission",
      value: serviceStats.length > 0 
        ? formatCurrency(serviceStats.reduce((s, st) => s + st.avgCommission, 0) / serviceStats.length)
        : formatCurrency(0),
      icon: <DollarSign className="w-6 h-6" />,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Conversion Rate",
      value: performance.totalBookings > 0 
        ? `${Math.round((performance.successfulBookings || 0) / performance.totalBookings * 100)}%`
        : "0%",
      icon: <TrendingUp className="w-6 h-6" />,
      color: "from-amber-500 to-orange-600"
    }
  ];

  return (
    <div className="space-y-8 pt-16 lg:pt-0">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
          Performance <span className="text-orange-600">Analytics</span>
        </h1>
        <p className="text-slate-500 mt-2">Track your earnings and performance over time</p>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {performanceCards.map((card, i) => (
          <Card key={i} className="border-0 shadow-xl overflow-hidden">
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${card.color} text-white flex items-center justify-center mb-4`}>
                {card.icon}
              </div>
              <p className="text-3xl font-bold text-slate-900">{card.value}</p>
              <p className="text-sm text-slate-500 mt-1">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Earnings Chart */}
        <Card className="border-0 shadow-xl lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              Monthly Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyEarnings.length > 0 ? (
              <div className="flex items-end gap-2 h-64">
                {monthlyEarnings.map((month, i) => {
                  const height = (month.total / maxEarning) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2">
                      <div className="text-xs text-slate-600 font-semibold">
                        {formatCurrency(month.total)}
                      </div>
                      <div 
                        className="w-full bg-gradient-to-t from-orange-500 to-amber-400 rounded-t-lg transition-all hover:scale-105 min-h-[8px]"
                        style={{ height: `${Math.max(height, 3)}%` }}
                      />
                      <div className="text-xs text-slate-500">
                        {monthNames[month._id.month - 1]}
                      </div>
                      <div className="text-xs text-slate-400">
                        {month.bookings} bookings
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-400">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-200" />
                  <p className="font-semibold">No earnings data yet</p>
                  <p className="text-sm">Start sharing your QR to see earnings here</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Performing Services */}
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              Top Services
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {serviceStats.length > 0 ? (
              serviceStats.map((service, i) => {
                const totalAll = serviceStats.reduce((s, st) => s + st.totalCommission, 0);
                const percentage = totalAll > 0 ? Math.round((service.totalCommission / totalAll) * 100) : 0;

                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${serviceBgColors[service._id] || "bg-slate-100 text-slate-600"}`}>
                          {serviceIcons[service._id] || <ShoppingBag className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">
                            {service._id === "HOTEL" ? "Hotels" : service._id === "RENTAL" ? "Rentals" : "Activities"}
                          </p>
                          <p className="text-xs text-slate-500">{service.totalBookings} bookings</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{formatCurrency(service.totalCommission)}</p>
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          {percentage}%
                        </Badge>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${serviceColors[service._id] || "from-slate-400 to-slate-500"} h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                <p className="font-semibold">No service data yet</p>
                <p className="text-sm">Complete bookings to see stats</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
