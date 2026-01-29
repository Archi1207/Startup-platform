'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, Twitter, Github, Linkedin, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { label: 'Deals', href: '/deals' },
      { label: 'Categories', href: '/deals?category=all' },
      { label: 'Partners', href: '#' },
      { label: 'Pricing', href: '#' },
    ],
    Company: [
      { label: 'About', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press', href: '#' },
    ],
    Legal: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'Cookies', href: '#' },
    ],
    Connect: [
      { label: 'Twitter', href: '#', icon: <Twitter className="w-4 h-4" /> },
      { label: 'GitHub', href: '#', icon: <Github className="w-4 h-4" /> },
      { label: 'LinkedIn', href: '#', icon: <Linkedin className="w-4 h-4" /> },
      { label: 'Contact', href: '#', icon: <Mail className="w-4 h-4" /> },
    ],
  };

  type FooterLink = { label: string; href: string; icon?: React.ReactElement };

  return (
    <footer className="relative bg-gray-900 border-t border-white/10">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid opacity-50" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">
                Startup<span className="text-gradient">Benefits</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Empowering early-stage startups with exclusive SaaS deals and partnerships. 
              Access premium tools at startup-friendly prices.
            </p>
            <div className="flex space-x-4">
              {footerLinks.Connect.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  aria-label={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          {Object.entries(footerLinks).map(([category, links], index) => (
            <div key={category} className={index === 3 ? 'lg:col-span-1' : ''}>
              <h3 className="text-white font-semibold mb-4">{category}</h3>
              <ul className="space-y-3">
                {(links as FooterLink[]).map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
                    >
                      {link.icon && <span>{link.icon}</span>}
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} StartupBenefits. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="#"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Privacy Policy
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="#"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Terms of Service
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05 }}
                href="#"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cookie Policy
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}