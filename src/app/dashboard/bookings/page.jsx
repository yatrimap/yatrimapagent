"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  ShoppingBag,
  Hotel,
  Car,
  Target,
  Search,
  Filter,
  Calendar,
  Loader2
} from 'lucide-react';

export default function BookingsPage() {
  const [bookings, setBookings] = useState({ hotels: [], activities: [], rentals: [] });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('agent_token');
      const res = await fetch(`${baseUrl}/agent-dashboard/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBookings(data.data || { hotels: [], activities: [], rentals: [] });
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
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

  const getStatusColor = (status) => {
    const s = (status || "pending").toLowerCase();
    if (s === "confirmed" || s === "completed") return "bg-green-100 text-green-700";
    if (s === "pending") return "bg-amber-100 text-amber-700";
    if (s === "cancelled" || s === "refunded") return "bg-red-100 text-red-700";
    return "bg-slate-100 text-slate-700";
  };

  const serviceConfig = {
    hotel: { icon: <Hotel className="w-4 h-4" />, color: "bg-blue-100 text-blue-600", label: "Hotel" },
    activity: { icon: <Target className="w-4 h-4" />, color: "bg-orange-100 text-orange-600", label: "Activity" },
    rental: { icon: <Car className="w-4 h-4" />, color: "bg-green-100 text-green-600", label: "Rental" }
  };

  // Combine and sort all bookings
  const allBookings = [
    ...bookings.hotels,
    ...bookings.activities,
    ...bookings.rentals
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const filteredBookings = allBookings.filter(b => {
    if (filter !== "all" && b.type !== filter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        (b.serviceName || "").toLowerCase().includes(q) ||
        (b.customerName || "").toLowerCase().includes(q) ||
        (b.email || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filterButtons = [
    { key: "all", label: "All", count: allBookings.length },
    { key: "hotel", label: "Hotels", count: bookings.hotels.length },
    { key: "activity", label: "Activities", count: bookings.activities.length },
    { key: "rental", label: "Rentals", count: bookings.rentals.length },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-12 h-12 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pt-16 lg:pt-0">
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900">
          Your <span className="text-orange-600">Bookings</span>
        </h1>
        <p className="text-slate-500 mt-2">All bookings made through your QR code</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {filterButtons.map(f => (
            <Button
              key={f.key}
              variant={filter === f.key ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.key)}
              className={filter === f.key ? "bg-orange-500 hover:bg-orange-600" : ""}
            >
              {f.label}
              <Badge className="ml-2 bg-white/20 text-inherit">{f.count}</Badge>
            </Button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search by name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Bookings List */}
      <Card className="border-0 shadow-xl">
        <CardContent className="p-0">
          {filteredBookings.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredBookings.map((booking, i) => {
                const config = serviceConfig[booking.type] || serviceConfig.hotel;
                return (
                  <div key={i} className="flex items-center gap-4 p-5 hover:bg-slate-50 transition-all">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${config.color}`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 truncate">{booking.serviceName}</p>
                        <Badge className={`text-xs ${config.color}`}>
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                        <span>{booking.customerName}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-slate-900">{formatCurrency(booking.totalAmount)}</p>
                      <Badge className={getStatusColor(booking.status)}>
                        {booking.status || "pending"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <ShoppingBag className="w-20 h-20 text-slate-200 mx-auto mb-4" />
              <p className="text-xl font-semibold text-slate-400">No bookings found</p>
              <p className="text-slate-400 mt-1">
                {searchQuery ? "Try a different search term" : "Share your QR code to get bookings!"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
