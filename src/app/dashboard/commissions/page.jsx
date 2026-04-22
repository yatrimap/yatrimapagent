"use client";

import { useState, useEffect } from 'react';
import { useAgent } from '@/context/AgentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2,
  Filter,
  Download
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export default function CommissionsPage() {
  const { agent: agentData } = useAgent();
  
  // Extract nested data from API response
  const agent = agentData?.agent || {};
  const commission = agentData?.commission || {};
  const [commissions, setCommissions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchCommissions();
  }, []);

  const fetchCommissions = async () => {
    try {
      const token = localStorage.getItem('agent_token');
      const res = await fetch(`${baseUrl}/agent-dashboard/commissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCommissions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch commissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCommissions = commissions.filter(c => 
    filter === 'all' || c.status === filter
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'APPROVED': return <ArrowDownLeft className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5 text-amber-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700 border-green-200';
      case 'APPROVED': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-amber-100 text-amber-700 border-amber-200';
    }
  };

  return (
    <div className="space-y-8 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-2">
            Commissions <span className="text-orange-600">History</span>
          </h1>
          <p className="text-xl text-slate-500">
            Track all your earnings from bookings and pooling
          </p>
        </div>
        <Button variant="outline" className="h-14 px-6 text-lg border-2">
          <Download className="w-5 h-5 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-lg mb-1">Total Earned</p>
                <p className="text-4xl font-bold">₹{commission?.totalEarned?.toLocaleString() || '0'}</p>
              </div>
              <Wallet className="w-12 h-12 text-white/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-lg mb-1">Pending</p>
                <p className="text-4xl font-bold text-amber-600">₹{commission?.totalPending?.toLocaleString() || '0'}</p>
              </div>
              <Clock className="w-12 h-12 text-amber-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-lg mb-1">Paid Out</p>
                <p className="text-4xl font-bold text-green-600">₹{commission?.totalPaid?.toLocaleString() || '0'}</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-4">
        <Filter className="w-5 h-5 text-slate-400" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48 h-12 text-lg border-2">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Commissions</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="APPROVED">Approved</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Commissions List */}
      <div className="space-y-4">
        {filteredCommissions.map((commission) => (
          <Card key={commission.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                    commission.serviceType === 'hotel' ? 'bg-blue-100 text-blue-600' :
                    commission.serviceType === 'activity' ? 'bg-orange-100 text-orange-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {commission.serviceType === 'hotel' ? '🏨' :
                     commission.serviceType === 'activity' ? '🎯' : '🚗'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{commission.serviceName}</h3>
                    <p className="text-slate-500">Customer: {commission.customerName}</p>
                    <p className="text-sm text-slate-400">{new Date(commission.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Booking Amount</p>
                    <p className="text-lg font-semibold text-slate-900">₹{commission.bookingAmount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Your Commission</p>
                    <p className="text-2xl font-bold text-green-600">+₹{commission.commissionAmount}</p>
                  </div>
                  <Badge className={`h-10 px-4 text-base font-semibold capitalize ${getStatusColor(commission.status)}`}>
                    {getStatusIcon(commission.status)}
                    <span className="ml-2">{commission.status}</span>
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCommissions.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lg">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wallet className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No commissions found</h3>
            <p className="text-lg text-slate-500">Start sharing your QR code to earn commissions!</p>
          </div>
        )}
      </div>
    </div>
  );
}