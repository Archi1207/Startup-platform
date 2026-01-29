'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import ThreeScene from '@/components/animations/ThreeScene';
import { Sparkles, Zap, Shield, Globe } from 'lucide-react';

export default function Home() {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Exclusive SaaS Deals',
      description: 'Access premium tools at startup-friendly prices'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Verified Access',
      description: 'Unlock restricted deals with startup verification'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Curated Selection',
      description: 'Hand-picked tools for early-stage startups'
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Global Network',
      description: 'Connect with partners worldwide'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid" />
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(120, 119, 198, 0.15), transparent 80%)`
          }}
        />
      </div>

      {/* Hero Section */}
      <motion.section 
        className="relative z-10 min-h-screen flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          {/* 3D Scene */}
          <div className="h-64 md:h-96 mb-8 relative">
            <ThreeScene />
          </div>

          <motion.div
            style={{ opacity, scale }}
            className="space-y-8"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold mb-4">
                For Startup Founders & Early Teams
              </span>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                Premium Tools.
                <span className="block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Startup Prices.
                </span>
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Access exclusive SaaS deals, partnerships, and benefits 
                curated specifically for early-stage startups and indie hackers.
              </p>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link
                href="/deals"
                className="px-8 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
              >
                Explore Deals
              </Link>
              <Link
                href="/register"
                className="px-8 py-4 rounded-lg bg-white/10 text-white font-semibold text-lg backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                Join Platform
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2" />
          </div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose Our Platform
            </h2>
            <p className="text-gray-400 text-lg">
              Built for founders, by founders
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.05 }}
                className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/30 transition-all duration-300 group"
              >
                <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-purple-600/20 to-pink-600/20 mb-6 group-hover:from-purple-600/30 group-hover:to-pink-600/30">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative z-10 py-20 px-4"
      >
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
            <div className="relative bg-gray-900 rounded-3xl p-12 border border-white/10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Accelerate Your Startup?
              </h2>
              <p className="text-gray-400 mb-8 text-lg">
                Join hundreds of founders already saving thousands on essential tools
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
              >
                <Sparkles className="w-5 h-5" />
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}