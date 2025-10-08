'use client'
import React from 'react';
import { Zap, Layout, DollarSign, TrendingUp, Info, Briefcase, Newspaper, Phone, BookOpen, LifeBuoy, Users, Shield, Twitter, Github, Linkedin, Youtube } from 'lucide-react';

export default function ModernFooter() {
  const productLinks = [
    { icon: Zap, text: 'Features', href: '#' },
    { icon: Layout, text: 'Integrations', href: '#' },
    { icon: DollarSign, text: 'Pricing', href: '#' },
    { icon: TrendingUp, text: 'Updates', href: '#' }
  ];

  const companyLinks = [
    { icon: Info, text: 'About', href: '#' },
    { icon: Briefcase, text: 'Careers', href: '#' },
    { icon: Newspaper, text: 'Blog', href: '#' },
    { icon: Phone, text: 'Contact', href: '#' }
  ];

  const resourceLinks = [
    { icon: BookOpen, text: 'Documentation', href: '#' },
    { icon: LifeBuoy, text: 'Support', href: '#' },
    { icon: Users, text: 'Community', href: '#' },
    { icon: Shield, text: 'Security', href: '#' }
  ];

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Youtube, href: '#', label: 'YouTube' }
  ];

  return (
    <div className="bg-[#0a0a0a] flex flex-col relative">
      
      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-[#0a0a0a] to-[#111] border-t border-[#00ff8820] overflow-hidden">
        {/* Animated top border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#00ff88] to-transparent animate-pulse"></div>

        <div className="max-w-7xl mx-auto px-8 py-16">
          {/* Logo and Footer Grid */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-12">
            
            {/* Logo Placeholder */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                TX
              </div>
              <p className="mt-4 text-gray-400 text-sm max-w-xs">
                TradeX — Smart Trading, Real-Time Insights. Built with ❤️ by IIT BHU Varanasi | Prepathon 2025
              </p>
            </div>

            {/* Footer Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 flex-1">
              {/* Product Section */}
              <div>
                <h3 className="text-[#00ff88] text-xl font-semibold mb-6">Product</h3>
                <ul className="space-y-3">
                  {productLinks.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.href}
                        className="flex items-center gap-2 text-gray-500 hover:text-[#00ff88] transition-all duration-300 hover:translate-x-1 group"
                      >
                        <link.icon className="w-4 h-4" />
                        <span>{link.text}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company Section */}
              <div>
                <h3 className="text-[#00ff88] text-xl font-semibold mb-6">Company</h3>
                <ul className="space-y-3">
                  {companyLinks.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.href}
                        className="flex items-center gap-2 text-gray-500 hover:text-[#00ff88] transition-all duration-300 hover:translate-x-1 group"
                      >
                        <link.icon className="w-4 h-4" />
                        <span>{link.text}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources Section */}
              <div>
                <h3 className="text-[#00ff88] text-xl font-semibold mb-6">Resources</h3>
                <ul className="space-y-3">
                  {resourceLinks.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.href}
                        className="flex items-center gap-2 text-gray-500 hover:text-[#00ff88] transition-all duration-300 hover:translate-x-1 group"
                      >
                        <link.icon className="w-4 h-4" />
                        <span>{link.text}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Connect Section */}
          <div className="mt-12 flex justify-start gap-4">
            {socialLinks.map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                aria-label={social.label}
                className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#00ff8830] flex items-center justify-center text-gray-500 hover:text-[#00ff88] hover:bg-[#00ff8820] hover:border-[#00ff88] hover:-translate-y-1 transition-all duration-300"
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>©️ 2025 TradeX. All rights reserved.</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-[#00ff88] transition-colors duration-300">
                Privacy
              </a>
              <a href="#" className="hover:text-[#00ff88] transition-colors duration-300">
                Terms
              </a>
              <a href="#" className="hover:text-[#00ff88] transition-colors duration-300">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}