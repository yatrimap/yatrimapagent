"use client";

import { useState, useEffect } from 'react';
import { useAgent } from '@/context/AgentContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  IndianRupee,
  Banknote,
  History,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function WalletPage() {
  const { agent: agentData, refreshAgent } = useAgent();
  
  // Extract nested data from API response
  const agent = agentData?.agent || {};
  const wallet = agentData?.wallet || {};
  const commission = agentData?.commissionSummary || agentData?.commission || {};
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchWithdrawHistory();
  }, []);

  const fetchWithdrawHistory = async () => {
    try {
      const token = localStorage.getItem('agent_token');
      const res = await fetch(`${baseUrl}/agent-dashboard/withdraw/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setWithdrawals(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch withdraw history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amount > (wallet?.balance || 0)) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('agent_token');
      const res = await fetch(`${baseUrl}/agent-dashboard/withdraw`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Withdrawal request submitted successfully!');
        setWithdrawAmount('');
        refreshAgent();
        fetchWithdrawHistory();
      } else {
        toast.error(data.message || 'Withdrawal failed');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PAID': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'APPROVED': return <CheckCircle2 className="w-5 h-5 text-blue-500" />;
      case 'PENDING': return <Clock className="w-5 h-5 text-amber-500" />;
      default: return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-700';
      case 'APPROVED': return 'bg-blue-100 text-blue-700';
      case 'PENDING': return 'bg-amber-100 text-amber-700';
      default: return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="space-y-8 pt-16 lg:pt-0">
      {/* Header */}
      <div>
        <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-2">
          Your <span className="text-orange-600">Wallet</span>
        </h1>
        <p className="text-xl text-slate-500">
          Manage your earnings and withdrawals
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500 to-amber-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-lg mb-1">Available Balance</p>
                <p className="text-4xl font-bold">₹{wallet?.withdrawableAmount?.toLocaleString() || wallet?.balance?.toLocaleString() || '0'}</p>
              </div>
              <Wallet className="w-12 h-12 text-white/30" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-lg mb-1">Total Earned</p>
                <p className="text-4xl font-bold text-slate-900">₹{(commission?.totalEarned || wallet?.totalEarnings || wallet?.lifetimeEarnings || 0).toLocaleString()}</p>
              </div>
              <ArrowDownLeft className="w-12 h-12 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-lg mb-1">Total Withdrawn</p>
                <p className="text-4xl font-bold text-blue-600">
                  ₹{(commission?.totalPaid || wallet?.totalWithdrawn || 0).toLocaleString()}
                </p>
              </div>
              <ArrowUpRight className="w-12 h-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Withdraw Form */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Banknote className="w-6 h-6 text-orange-500" />
              Request Withdrawal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-slate-900 mb-3">
                Enter Amount
              </label>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                <Input
                  type="number"
                  placeholder="0"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="h-16 pl-12 text-3xl font-bold border-2 focus:border-orange-500"
                />
              </div>
              <p className="text-sm text-slate-500 mt-2">
                Minimum withdrawal: ₹500
              </p>
            </div>

            <div className="flex gap-3">
              {[500, 1000, 2000, 5000].map(amount => (
                <button
                  key={amount}
                  onClick={() => setWithdrawAmount(amount.toString())}
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-orange-100 text-slate-700 hover:text-orange-700 rounded-xl font-semibold transition-colors"
                >
                  ₹{amount}
                </button>
              ))}
            </div>

            <Button
              onClick={handleWithdraw}
              disabled={loading || !withdrawAmount}
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <ArrowUpRight className="w-5 h-5 mr-2" />
                  Request Withdrawal
                </>
              )}
            </Button>

            <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900">Withdrawal Info</p>
                  <p className="text-sm text-blue-700 mt-1">
                    Withdrawals are processed within 24-48 hours. Make sure your bank details are updated in your profile.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Withdrawal History */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <History className="w-6 h-6 text-orange-500" />
              Withdrawal History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[400px] overflow-y-auto">
              {withdrawals.map((withdrawal, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(withdrawal.status)}
                    <div>
                      <p className="font-semibold text-slate-900">₹{withdrawal.amount}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(withdrawal.status)} capitalize`}>
                    {withdrawal.status}
                  </Badge>
                </motion.div>
              ))}

              {withdrawals.length === 0 && !historyLoading && (
                <div className="text-center py-12">
                  <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500">No withdrawal history yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
