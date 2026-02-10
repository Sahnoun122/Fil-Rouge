'use client';

import { useState } from 'react';
import Link from 'next/link';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/95 backdrop-blur-sm fixed w-full z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="font-bold text-xl text-slate-900">
              <span className="text-violet-500">MarketPlan</span> IA
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <Link href="#features" className="text-slate-600 hover:text-slate-900 transition-colors duration-200">
                Fonctionnalités
              </Link>
              <Link href="#how-it-works" className="text-slate-600 hover:text-slate-900 transition-colors duration-200">
                Comment ça marche
              </Link>
              <Link href="#swot" className="text-slate-600 hover:text-slate-900 transition-colors duration-200">
                SWOT
              </Link>
              <Link href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors duration-200">
                Tarifs
              </Link>
              <Link href="#faq" className="text-slate-600 hover:text-slate-900 transition-colors duration-200">
                FAQ
              </Link>
            </div>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex space-x-4">
            <Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors duration-200">
              Connexion
            </Link>
            <Link
              href="/register"
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
            >
              Commencer
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 hover:text-slate-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b border-slate-200">
            <Link href="#features" className="block px-3 py-2 text-slate-600 hover:text-slate-900">
              Fonctionnalités
            </Link>
            <Link href="#how-it-works" className="block px-3 py-2 text-slate-600 hover:text-slate-900">
              Comment ça marche
            </Link>
            <Link href="#swot" className="block px-3 py-2 text-slate-600 hover:text-slate-900">
              SWOT
            </Link>
            <Link href="#pricing" className="block px-3 py-2 text-slate-600 hover:text-slate-900">
              Tarifs
            </Link>
            <Link href="#faq" className="block px-3 py-2 text-slate-600 hover:text-slate-900">
              FAQ
            </Link>
            <div className="mt-4 space-y-2">
              <Link href="/login" className="block px-3 py-2 text-slate-600 hover:text-slate-900">
                Connexion
              </Link>
              <Link
                href="/register"
                className="block px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-center"
              >
                Commencer
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;