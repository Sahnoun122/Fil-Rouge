'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Zap } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Pricing', href: '/pricing' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 top-0">
      {/* Glass bar */}
      <div className="mx-4 mt-4 rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-lg shadow-slate-900/5">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-linear-to-br from-violet-600 to-purple-600 flex items-center justify-center shadow-sm shadow-violet-400/40">
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900">MarketPlan <span className="text-violet-600">IA</span></span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-0.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-slate-500 rounded-xl hover:text-slate-900 hover:bg-slate-100/80 transition-all duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-600 rounded-xl hover:bg-slate-100 transition-all">
                Log in
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-bold text-white rounded-xl bg-linear-to-br from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 transition-all shadow-md shadow-violet-400/30 hover:shadow-violet-400/50 hover:-translate-y-px"
              >
                Start Free →
              </Link>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden mx-4 mt-2 rounded-2xl bg-white border border-slate-200 shadow-xl px-5 py-4">
          <div className="flex flex-col gap-1 mb-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="px-4 py-3 text-sm font-medium text-slate-700 rounded-xl hover:bg-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/login" onClick={() => setIsMenuOpen(false)}
              className="py-2.5 text-sm font-medium text-center text-slate-700 rounded-xl border border-slate-200 hover:bg-slate-50">
              Log in
            </Link>
            <Link href="/register" onClick={() => setIsMenuOpen(false)}
              className="py-2.5 text-sm font-bold text-center text-white rounded-xl bg-linear-to-r from-violet-600 to-purple-600">
              Start Free
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;