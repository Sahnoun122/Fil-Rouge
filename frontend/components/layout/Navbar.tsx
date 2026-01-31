import React from 'react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Marketing Intelligent
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition duration-300">
              Accueil
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 transition duration-300">
              Dashboard
            </Link>
            <Link href="/strategies" className="text-gray-700 hover:text-blue-600 transition duration-300">
              Stratégies
            </Link>
            <Link href="/content" className="text-gray-700 hover:text-blue-600 transition duration-300">
              Contenu
            </Link>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex space-x-4">
            <Link 
              href="/login" 
              className="text-blue-600 hover:text-blue-800 transition duration-300"
            >
              Connexion
            </Link>
            <Link 
              href="/register" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300"
            >
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}