'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DealCard from '@/components/deals/DealCard';
import DealFilters from '@/components/deals/DealFilters';
import SearchBar from '@/components/deals/SearchBar';
import { useDeals } from '@/lib/api/deals';
import { 
  Filter, 
  Search, 
  Shield, 
  Zap,
  Grid,
  List,
  Loader2
} from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'cloud', label: 'Cloud Services' },
  { value: 'marketing', label: 'Marketing Tools' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'development', label: 'Development' },
  { value: 'design', label: 'Design' },
];

const ACCESS_LEVELS = [
  { value: '', label: 'All Access' },
  { value: 'public', label: 'Public' },
  { value: 'verified', label: 'Verified Only' },
];

export default function DealsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [accessLevel, setAccessLevel] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const { 
    data: dealsData, 
    isLoading, 
    error,
    mutate 
  } = useDeals({
    search: searchQuery,
    category: category || undefined,
    accessLevel: accessLevel || undefined,
  });

  const [deals, setDeals] = useState<any[]>([]);

  useEffect(() => {
    if (dealsData?.data) {
      setDeals(dealsData.data);
    }
  }, [dealsData]);

  // Filter deals based on search
  const filteredDeals = useMemo(() => {
    if (!searchQuery) return deals;
    
    return deals.filter(deal => {
      const searchLower = searchQuery.toLowerCase();
      return (
        deal.title.toLowerCase().includes(searchLower) ||
        deal.description.toLowerCase().includes(searchLower) ||
        deal.partnerName.toLowerCase().includes(searchLower) ||
        deal.category.toLowerCase().includes(searchLower) ||
        deal.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      );
    });
  }, [deals, searchQuery]);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 pt-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">Error loading deals</div>
            <button
              onClick={() => mutate()}
              className="px-6 py-3 bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              Retry
            </button>
          </div>
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
          className="mb-12"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Exclusive Startup Deals
              </h1>
              <p className="text-gray-400 text-lg">
                Discover premium tools and services at startup-friendly prices
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'list' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchBar 
                onSearch={setSearchQuery}
                placeholder="Search deals, tools, or partners..."
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
                {(category || accessLevel) && (
                  <span className="inline-flex items-center justify-center w-6 h-6 text-xs bg-purple-600 rounded-full">
                    {[category, accessLevel].filter(Boolean).length}
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Access Level
                    </label>
                    <select
                      value={accessLevel}
                      onChange={(e) => setAccessLevel(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {ACCESS_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <button
                      onClick={() => {
                        setCategory('');
                        setAccessLevel('');
                      }}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-sm text-gray-400">
            {isLoading ? (
              'Loading deals...'
            ) : (
              <>
                Showing <span className="text-white font-medium">{filteredDeals.length}</span> deals
                {searchQuery && ` for "${searchQuery}"`}
              </>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {accessLevel === 'verified' && (
              <div className="flex items-center gap-2 text-sm text-yellow-400">
                <Shield className="w-4 h-4" />
                <span>Verification required</span>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-purple-500 mx-auto mb-4" />
              <p className="text-gray-400">Loading exclusive deals...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Empty State */}
            {filteredDeals.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="inline-flex p-6 rounded-full bg-white/5 mb-6">
                  <Search className="w-12 h-12 text-gray-500" />
                </div>
                <h3 className="text-2xl font-semibold text-white mb-2">
                  No deals found
                </h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery
                    ? `No deals matching "${searchQuery}"`
                    : 'No deals available at the moment'}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setCategory('');
                    setAccessLevel('');
                  }}
                  className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-700"
                >
                  Clear Search
                </button>
              </motion.div>
            )}

            {/* Deals Grid */}
            {filteredDeals.length > 0 && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-6'
                }
              >
                {filteredDeals.map((deal) => (
                  <DealCard
                    key={deal._id}
                    deal={deal}
                    viewMode={viewMode}
                  />
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}