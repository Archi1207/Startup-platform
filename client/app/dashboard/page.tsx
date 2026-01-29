'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Shield, 
  Zap, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Award,
  BarChart3
} from 'lucide-react';
import ClaimCard from '@/components/dashboard/ClaimCard';
import ProfileSection from '@/components/dashboard/ProfileSection';
import StatsCard from '@/components/dashboard/StatsCard';
import { useAuth } from '@/lib/auth/context';
import { api } from '@/lib/api/api';

interface Claim {
  _id: string;
  status: 'pending' | 'approved' | 'rejected' | 'redeemed';
  claimedAt: string;
  deal: {
    _id: string;
    title: string;
    partnerName: string;
    category: string;
    discount: string;
  };
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    redeemed: 0,
  });

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const response = await api.get('/deals/user/claims');
      setClaims(response.data.data);
      
      // Calculate stats
      const statsData = {
        total: response.data.data.length,
        pending: response.data.data.filter((c: Claim) => c.status === 'pending').length,
        approved: response.data.data.filter((c: Claim) => c.status === 'approved').length,
        rejected: response.data.data.filter((c: Claim) => c.status === 'rejected').length,
        redeemed: response.data.data.filter((c: Claim) => c.status === 'redeemed').length,
      };
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch claims:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'rejected': return 'text-red-400';
      case 'redeemed': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5" />;
      case 'pending': return <Clock className="w-5 h-5" />;
      case 'rejected': return <AlertCircle className="w-5 h-5" />;
      case 'redeemed': return <Award className="w-5 h-5" />;
      default: return null;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 px-4">
        <div className="max-w-7xl mx-auto text-center py-20">
          <Shield className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-400 mb-8">
            Please log in to view your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Welcome back, {user.name} 👋
          </h1>
          <p className="text-gray-400 text-lg">
            Track your claimed deals and manage your profile
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          <StatsCard
            title="Total Claims"
            value={stats.total}
            icon={<TrendingUp className="w-6 h-6" />}
            gradient="from-blue-500 to-cyan-500"
            change="+12%"
          />
          <StatsCard
            title="Approved"
            value={stats.approved}
            icon={<CheckCircle className="w-6 h-6" />}
            gradient="from-green-500 to-emerald-500"
            change="+8%"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={<Clock className="w-6 h-6" />}
            gradient="from-yellow-500 to-orange-500"
            change="-3%"
          />
          <StatsCard
            title="Redeemed"
            value={stats.redeemed}
            icon={<Award className="w-6 h-6" />}
            gradient="from-purple-500 to-pink-500"
            change="+24%"
          />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile & Verification */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            <ProfileSection user={user} />

            {/* Verification Status */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Verification Status
              </h3>
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-lg ${
                  user.isVerified 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : 'bg-yellow-500/10 border border-yellow-500/20'
                }`}>
                  <div className="flex items-center gap-3">
                    <Shield className={`w-5 h-5 ${
                      user.isVerified ? 'text-green-400' : 'text-yellow-400'
                    }`} />
                    <div>
                      <p className="font-medium text-white">
                        {user.isVerified ? 'Verified' : 'Verification Pending'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {user.isVerified 
                          ? 'Full access to all deals' 
                          : 'Some deals require verification'
                        }
                      </p>
                    </div>
                  </div>
                  {!user.isVerified && (
                    <button className="px-4 py-2 text-sm rounded-lg bg-yellow-500 hover:bg-yellow-600">
                      Verify Now
                    </button>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Public Deals</span>
                    <span className="text-green-400">✓ Available</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Verified Deals</span>
                    <span className={user.isVerified ? 'text-green-400' : 'text-yellow-400'}>
                      {user.isVerified ? '✓ Available' : 'Verification required'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-gray-300">Browse Deals</span>
                  <Zap className="w-4 h-4" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-gray-300">Update Profile</span>
                  <User className="w-4 h-4" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-gray-300">View Analytics</span>
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Claims */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="glass-effect rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Your Claimed Deals
                </h2>
                <span className="text-sm text-gray-400">
                  {claims.length} total
                </span>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-400">Loading your claims...</p>
                  </div>
                </div>
              ) : claims.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex p-6 rounded-full bg-white/5 mb-6">
                    <Zap className="w-12 h-12 text-gray-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No claims yet
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Start claiming deals to see them here
                  </p>
                  <a
                    href="/deals"
                    className="inline-block px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    Browse Deals
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <ClaimCard
                      key={claim._id}
                      claim={claim}
                      onUpdate={fetchClaims}
                    />
                  ))}
                </div>
              )}

              {/* Status Legend */}
              {claims.length > 0 && (
                <div className="mt-8 pt-6 border-t border-white/10">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">
                    Status Legend
                  </h4>
                  <div className="flex flex-wrap gap-4">
                    {['pending', 'approved', 'rejected', 'redeemed'].map((status) => (
                      <div key={status} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          status === 'approved' ? 'bg-green-500' :
                          status === 'pending' ? 'bg-yellow-500' :
                          status === 'rejected' ? 'bg-red-500' :
                          'bg-purple-500'
                        }`} />
                        <span className="text-sm text-gray-300 capitalize">
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}