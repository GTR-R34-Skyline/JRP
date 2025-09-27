import React from 'react';
import { Link } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, className = '' }) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-amber-50 ${className}`}>
      {/* Tribal pattern background */}
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 400 400" className="w-full h-full">
          <defs>
            <pattern id="tribal-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M50,10 L90,50 L50,90 L10,50 Z" fill="currentColor" />
              <circle cx="50" cy="50" r="5" fill="currentColor" />
              <path d="M25,25 L75,25 L75,75 L25,75 Z" fill="none" stroke="currentColor" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tribal-pattern)" />
        </svg>
      </div>
      
      {/* Header */}
      <header className="relative bg-gradient-to-r from-green-600 to-green-700 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            
            {/* Left Side: Logo */}
            <Link to="/" className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-green-100 text-xs">Jharkhand Tourism Platform</h1>
              </div>
            </Link>

            {/* Right Side: Navigation & Admin Button */}
            <div className="flex items-center space-x-6">
                <nav className="hidden md:flex items-center space-x-6 text-green-100">
                  <Link to="/" className="hover:text-white font-medium transition-colors">Home</Link>
                  <Link to="/vendor/register" className="hover:text-white font-medium transition-colors">Become a Guide</Link>
                  <Link to="/vendor/dashboard" className="hover:text-white font-medium transition-colors">Vendor Dashboard</Link>
                  <Link to="/marketplace/register" className="hover:text-white font-medium transition-colors">Become a Vendor</Link> 
                </nav>

                <Link 
                    to="/admin/login" 
                    className="bg-white text-green-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-50 transition-colors"
                >
                    Admin Login
                </Link>
            </div>
            
          </div>
        </div>
      </header>
      
      <main className="relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;