'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Zap, 
  Shield, 
  Clock, 
  Users, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth/context';

interface DealCardProps {
  deal: any;
  viewMode: 'grid' | 'list';
}

export default function DealCard({ deal, viewMode }: DealCardProps) {
  const { user } = useAuth();
  
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

  if (viewMode === 'list') {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        className="glass-effect rounded-2xl p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Left side */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(deal.category)}`}>
                {deal.category}
              </span>
              {deal.accessLevel === 'verified' && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  Verified
                </span>
              )}
              {deal.featured && (
                <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
                  Featured
                </span>
              )}
              {deal.isClaimed && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                  <CheckCircle className="w-3 h-3" />
                  Claimed
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-white mb-2">
              {deal.title}
            </h3>
            <p className="text-gray-400 mb-4 line-clamp-2">
              {deal.description}
            </p>

            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{deal.claimCount} claimed</span>
              </div>
              {deal.validity && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Expires {new Date(deal.validity).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex flex-col items-end gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-gradient mb-1">
                {deal.discount}
              </div>
              <div className="text-sm text-gray-400">
                {deal.partnerName}
              </div>
            </div>

            <Link
              href={`/deals/${deal._id}`}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              {deal.isClaimed ? 'View Claim' : 'View Deal'}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="glass-effect rounded-2xl p-6 card-hover-effect"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(deal.category)}`}>
            {deal.category}
          </span>
          {deal.accessLevel === 'verified' && (
            <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
              <Shield className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>
        
        {deal.isClaimed && (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Claimed
          </span>
        )}
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-bold text-white mb-3 line-clamp-2">
        {deal.title}
      </h3>
      <p className="text-gray-400 text-sm mb-6 line-clamp-3">
        {deal.description}
      </p>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{deal.claimCount} claims</span>
        </div>
        {deal.validity && (
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{new Date(deal.validity).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>

      {/* Partner & Discount */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-sm text-gray-400">Partner</p>
          <p className="font-medium text-white">{deal.partnerName}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Discount</p>
          <p className="text-xl font-bold text-gradient">{deal.discount}</p>
        </div>
      </div>

      {/* Action Button */}
      <Link
        href={`/deals/${deal._id}`}
        className="block w-full text-center py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
      >
        {deal.isClaimed ? 'View Claim' : 'View Deal'}
      </Link>
    </motion.div>
  );
}