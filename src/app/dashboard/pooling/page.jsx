"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  MapPin, 
  Clock, 
  IndianRupee, 
  TrendingUp,
  Filter,
  Search,
  Zap,
  Shield,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import dashboardAPI, { refreshData } from '@/lib/api-service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";


export default function LivePoolingPage() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [membersToSupply, setMembersToSupply] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  useEffect(() => {
    fetchPoolingData();
    // Refresh pooling data every 30 seconds
    const interval = setInterval(fetchPoolingData, 30000);
    return () => clearInterval(interval);
  }, [filter, pagination.page]);

  const fetchPoolingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const urgencyParam = filter !== 'all' ? filter : undefined;
      const response = await dashboardAPI.getPoolingRequests(urgencyParam);
      
      if (response.success) {
        setRequests(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.message || 'Failed to fetch pooling requests');
        setRequests([]);
      }
    } catch (error) {
      console.error('Failed to fetch pooling data:', error);
      setError('Unable to load pooling opportunities. Please try again.');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSupplyMembers = async () => {
    if (!selectedRequest || !membersToSupply) {
      toast.error('Please enter number of members');
      return;
    }

    if (membersToSupply > selectedRequest.neededMembers) {
      toast.error(`Can only supply up to ${selectedRequest.neededMembers} members`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await dashboardAPI.supplyPoolingMembers(
        selectedRequest.id,
        membersToSupply
      );

      if (response.success) {
        toast.success(`✅ Supplied ${membersToSupply} members! Earned ₹${response.data.totalEarnings}`);
        setSelectedRequest(null);
        setMembersToSupply(1);
        // Refresh both pooling and wallet data
        refreshData('pooling');
        refreshData('wallet');
        // Re-fetch after 1 second
        setTimeout(fetchPoolingData, 1000);
      } else {
        toast.error(response.message || 'Failed to supply members');
      }
    } catch (error) {
      console.error('Error supplying members:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = (req.activityName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (req.location || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const urgencyColors = {
    high: 'bg-red-500 text-white',
    medium: 'bg-amber-500 text-white',
    low: 'bg-green-500 text-white'
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="space-y-8 pt-16 lg:pt-0">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900">
              Live Pooling
            </h1>
            <span className="relative flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
            </span>
          </div>
          <p className="text-xl text-slate-500">
            Real-time member sharing opportunities. Supply members & earn extra commission!
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">
          <Zap className="w-5 h-5" />
          Live Market Active
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">{error}</p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchPoolingData}
                className="mt-2"
              >
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-lg bg-white">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input 
                placeholder="Search activities or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 text-lg border-2"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0">
              {['all', 'high', 'medium', 'low'].map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  onClick={() => {
                    setFilter(f);
                    setPagination({ ...pagination, page: 1 });
                  }}
                  className={`h-14 px-6 text-lg font-semibold capitalize rounded-xl ${
                    filter === f ? 'bg-slate-900' : ''
                  }`}
                >
                  {f === 'all' ? 'All Requests' : `${f} Urgency`}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Loading pooling opportunities...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Requests Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  className="group"
                >
                  <Card className="border-0 shadow-xl bg-white overflow-hidden hover:shadow-2xl transition-all duration-300">
                    {/* Urgency Banner */}
                    <div className={`px-6 py-3 ${urgencyColors[request.urgencyLevel] || 'bg-slate-500 text-white'} flex items-center justify-between`}>
                      <span className="font-bold text-lg capitalize flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        {request.urgencyLevel} Urgency
                      </span>
                      <span className="font-semibold">{request.timeLeft} left</span>
                    </div>

                    <CardContent className="p-6 space-y-4">
                      {/* Activity Info */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 mb-1">
                            {request.activityName || 'Activity'}
                          </h3>
                          <div className="flex items-center gap-2 text-slate-500 text-lg">
                            <MapPin className="w-5 h-5" />
                            {request.location || 'Location TBA'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-orange-600">
                            {formatCurrency(request.commissionPerPerson)}
                          </div>
                          <p className="text-sm text-slate-500">commission/person</p>
                        </div>
                      </div>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-lg font-semibold">
                          <span className="text-slate-600">Group Fill Progress</span>
                          <span className="text-slate-900">
                            {request.totalCurrentMembers}/{request.totalCurrentMembers + request.neededMembers}
                          </span>
                        </div>
                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${Math.min((request.totalCurrentMembers / (request.totalCurrentMembers + request.neededMembers)) * 100, 100)}%` 
                            }}
                          />
                        </div>
                        <p className="text-slate-500 font-medium">
                          Needs <span className="text-orange-600 font-bold">{request.neededMembers}</span> more members
                        </p>
                      </div>

                      {/* Price Info */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                          <p className="text-sm text-slate-500">Customer Pays</p>
                          <p className="text-xl font-bold text-slate-900">{formatCurrency(request.pricePerPerson)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-500">Your Earning</p>
                          <p className="text-xl font-bold text-green-600">{formatCurrency(request.commissionPerPerson)}</p>
                        </div>
                      </div>

                      {/* Security Note */}
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Shield className="w-4 h-4" />
                        <span>Details encrypted until supply</span>
                      </div>

                      {/* Action Button */}
                      <Button 
                        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 rounded-xl"
                        onClick={() => {
                          setSelectedRequest(request);
                          setMembersToSupply(1);
                        }}
                        disabled={loading}
                      >
                        <Users className="w-5 h-5 mr-2" />
                        Supply Members
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {filteredRequests.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No pooling opportunities</h3>
              <p className="text-lg text-slate-500">Check back soon for new member pooling requests!</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <span className="text-slate-600 font-semibold">
                Page {pagination.page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPagination({ ...pagination, page: Math.min(pagination.pages, pagination.page + 1) })}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Supply Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Supply Members</DialogTitle>
            <DialogDescription className="text-lg">
              You are supplying members for {selectedRequest?.activityName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="p-4 bg-orange-50 rounded-xl border-2 border-orange-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600 font-semibold">Commission per person</span>
                <span className="text-2xl font-bold text-orange-600">
                  {formatCurrency(selectedRequest?.commissionPerPerson)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-semibold">Available spots</span>
                <span className="text-xl font-bold text-slate-900">{selectedRequest?.neededMembers}</span>
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-slate-900 mb-3">
                How many members can you supply?
              </label>
              <div className="flex items-center gap-4">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setMembersToSupply(Math.max(1, membersToSupply - 1))}
                  disabled={membersToSupply === 1 || submitting}
                >
                  −
                </Button>
                <Input
                  type="number"
                  min="1"
                  max={selectedRequest?.neededMembers}
                  value={membersToSupply}
                  onChange={(e) => setMembersToSupply(Math.min(selectedRequest?.neededMembers, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="h-14 text-2xl text-center font-bold border-2"
                />
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setMembersToSupply(Math.min(selectedRequest?.neededMembers, membersToSupply + 1))}
                  disabled={membersToSupply >= (selectedRequest?.neededMembers || 0) || submitting}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="p-4 bg-green-50 rounded-xl border-2 border-green-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-semibold text-lg">Total Earning</span>
                <span className="text-3xl font-bold text-green-600">
                  {formatCurrency((selectedRequest?.commissionPerPerson || 0) * membersToSupply)}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1 h-12 text-lg"
                onClick={() => setSelectedRequest(null)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 h-12 text-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                onClick={handleSupplyMembers}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Confirm Supply
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}