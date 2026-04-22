"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Loader2,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AgentLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${baseUrl}/agent-dashboard/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (data.status == 'SUCCESS') {
        localStorage.setItem('agent_token', data.data.token);
        toast.success('Login successful!');
        router.push('/dashboard');
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-600 rounded-3xl shadow-xl shadow-orange-200 mb-4">
            <MapPin className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
            YatriMap
          </h1>
          <p className="text-slate-500 text-lg mt-2">Agent Portal</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-slate-900">
              Welcome Back!
            </CardTitle>
            <p className="text-slate-500">Login to access your agent dashboard</p>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="agent@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-14 pl-12 text-lg border-2 focus:border-orange-500 rounded-xl"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="h-14 pl-12 pr-12 text-lg border-2 focus:border-orange-500 rounded-xl"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500" />
                  <span className="text-sm text-slate-600">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-lg font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 rounded-xl shadow-lg shadow-orange-200"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Login <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-500">
                Don't have an account?{' '}
                <Link href="/register" className="font-semibold text-orange-600 hover:text-orange-700">
                  Register as Agent
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="p-4 bg-white/50 rounded-2xl">
            <div className="text-2xl mb-1">💰</div>
            <p className="text-sm font-semibold text-slate-700">5% Commission</p>
          </div>
          <div className="p-4 bg-white/50 rounded-2xl">
            <div className="text-2xl mb-1">📱</div>
            <p className="text-sm font-semibold text-slate-700">QR Booking</p>
          </div>
          <div className="p-4 bg-white/50 rounded-2xl">
            <div className="text-2xl mb-1">⚡</div>
            <p className="text-sm font-semibold text-slate-700">Live Pooling</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
