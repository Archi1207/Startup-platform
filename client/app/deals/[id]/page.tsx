'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  ArrowLeft, 
  Zap, 
  Shield, 
  CheckCircle, 
  Clock, 
  Users,
  Globe,
  Tag,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { api } from '@/lib/api/api';

interface DealDetails {
  _id: string;
  title: string;
  description: string;
  longDescription: string;
  partnerName: string;
  partnerLogo: string;
  category: string;
  accessLevel: string;
  discount: string;
  originalPrice: string;
  discountPrice: string;
  validity: string;
  eligibilityConditions: string[];
  requirements: string[];
  claimCount: number;
  maxClaims: number | null;
  isClaimed: boolean;
  claimStatus: string | null;
  tags: string[];
  featured: boolean;
}

export default function DealDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [deal, setDeal] = useState<DealDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDeal();
  }, [params.id]);

  const fetchDeal = async () => {
    try {
      const response = await api.get(`/deals/${params.id}`);
      setDeal(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load deal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimDeal = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (deal?.accessLevel === 'verified' && !user.isVerified) {
      setError('Verification required to claim this deal');
      return;
    }

    setIsClaiming(true);
    setError('');

    try {
      await api.post(`/deals/${params.id}/claim`);
      // Refresh deal data
      await fetchDeal();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to claim deal');
    } finally {
      setIsClaiming(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      cloud: 'bg-blue-500/20 text-blue-400',
      marketing: 'bg-green-500/20 text-green-400',
      analytics: 'bg-purple-500/20 text-purple-400',
      productivity: 'bg-yellow-500/20 text-yellow-400',
      development: 'bg-red-500/20 text-red-400',
      design: 'bg-pink-500/20 text-pink-400',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-400';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-white/10 rounded w-1/4" />
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-white/10 rounded-2xl" />
                <div className="h-32 bg-white/10 rounded-2xl" />
              </div>
              <div className="h-96 bg-white/10 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 px-4">
        <div className="max-w-7xl mx-auto text-center py-20">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Deal not found</h2>
          <p className="text-gray-400 mb-8">
            The deal you're looking for doesn't exist or has been removed.
          </p>
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Deals
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-24 px-4 pb-12">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Deals
          </Link>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Header */}
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(deal.category)}`}>
                  {deal.category}
                </span>
                {deal.accessLevel === 'verified' && (
                  <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 text-yellow-400 text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    Verification Required
                  </span>
                )}
                {deal.featured && (
                  <span className="px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 text-sm font-medium">
                    Featured
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white">
                {deal.title}
              </h1>

              <div className="flex items-center gap-6 text-gray-400">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>{deal.claimCount} claimed</span>
                </div>
                {deal.validity && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    <span>Valid until {new Date(deal.validity).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Partner Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="glass-effect rounded-2xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center">
                  {deal.partnerLogo ? (
                    <Image
                      src={deal.partnerLogo}
                      alt={deal.partnerName}
                      width={64}
                      height={64}
                      className="rounded-lg"
                    />
                  ) : (
                    <div className="text-2xl font-bold text-gradient">
                      {deal.partnerName.charAt(0)}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {deal.partnerName}
                  </h3>
                  <p className="text-gray-400">Official Partner</p>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-white">About this deal</h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                {deal.longDescription || deal.description}
              </p>
            </motion.div>

            {/* Discount Details */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="glass-effect rounded-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">Discount Details</h3>
                <div className="text-3xl font-bold text-gradient">
                  {deal.discount}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 mb-2">Original Price</p>
                  <p className="text-2xl line-through text-gray-500">
                    {deal.originalPrice}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-2">Your Price</p>
                  <p className="text-3xl font-bold text-white">
                    {deal.discountPrice}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Requirements & Eligibility */}
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-white">
                  Eligibility Conditions
                </h3>
                <ul className="space-y-3">
                  {deal.eligibilityConditions.map((condition, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
                      <span className="text-gray-300">{condition}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-white">
                  Requirements
                </h3>
                <ul className="space-y-3">
                  {deal.requirements.map((req, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                      <span className="text-gray-300">{req}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Tags */}
            {deal.tags && deal.tags.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <h3 className="text-xl font-semibold text-white mb-4">
                  Related Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {deal.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 rounded-full bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar - Claim Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* Claim Card */}
            <div className="glass-effect rounded-2xl p-6 sticky top-24">
              {deal.isClaimed ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex p-4 rounded-full bg-green-500/20 mb-4">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Deal Claimed!
                    </h3>
                    <p className="text-gray-400 mb-4">
                      Your claim is {deal.claimStatus}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-white/5">
                      <p className="text-sm text-gray-400">Claim Status</p>
                      <p className="text-lg font-semibold capitalize text-white">
                        {deal.claimStatus}
                      </p>
                    </div>
                    
                    <Link
                      href="/dashboard"
                      className="block w-full text-center py-3 rounded-lg bg-purple-600 hover:bg-purple-700"
                    >
                      View in Dashboard
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 mb-4">
                      <Zap className="w-8 h-8 text-gradient" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Ready to claim?
                    </h3>
                    <p className="text-gray-400">
                      Get instant access to this exclusive deal
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                      {error}
                    </div>
                  )}

                  {/* Access Restriction Warning */}
                  {deal.accessLevel === 'verified' && !user?.isVerified && (
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-yellow-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-400">
                            Verification Required
                          </p>
                          <p className="text-sm text-yellow-300/80 mt-1">
                            This deal requires startup verification.
                            Please complete your profile verification.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Claim Limits */}
                  {deal.maxClaims && (
                    <div className="p-4 rounded-lg bg-blue-500/10">
                      <p className="text-sm text-blue-400">
                        {deal.maxClaims - deal.claimCount} claims remaining
                      </p>
                      <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          style={{ 
                            width: `${(deal.claimCount / deal.maxClaims) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={handleClaimDeal}
                    disabled={
                      isClaiming || 
                      (deal.accessLevel === 'verified' && !user?.isVerified) ||
                      !user
                    }
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {isClaiming ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Claiming...</span>
                      </>
                    ) : !user ? (
                      'Login to Claim'
                    ) : deal.accessLevel === 'verified' && !user.isVerified ? (
                      'Verification Required'
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        <span>Claim This Deal</span>
                      </>
                    )}
                  </button>

                  {/* Additional Info */}
                  <div className="space-y-3 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Instant access after approval</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-400" />
                      <span>Approval within 24 hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <span>Global availability</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stats Card */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Deal Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Claims</span>
                  <span className="text-white font-semibold">
                    {deal.claimCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Access Level</span>
                  <span className={`font-semibold ${
                    deal.accessLevel === 'verified' 
                      ? 'text-yellow-400' 
                      : 'text-green-400'
                  }`}>
                    {deal.accessLevel === 'verified' ? 'Verified' : 'Public'}
                  </span>
                </div>
                {deal.maxClaims && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Max Claims</span>
                    <span className="text-white font-semibold">
                      {deal.maxClaims}
                    </span>
                  </div>
                )}
                {deal.validity && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Expires</span>
                    <span className="text-white font-semibold">
                      {new Date(deal.validity).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}