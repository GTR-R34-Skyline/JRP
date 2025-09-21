import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, Link } from 'react-router-dom';
import { Users, BarChart3, MapPin, Shield } from 'lucide-react';
import Layout from './components/Layout';
import VendorRegistration from './components/VendorRegistration';
import VendorDashboard from './components/VendorDashboard';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';

// Homepage Component
const HomePage = () => (
  <>
    {/* Hero Section */}
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Welcome to <span className="text-green-600">Jharkhand</span> Tourism Registration Platform
        </h1>
        <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
Join our official network of trusted tourism partners. Showcase your unique services to a global audience, manage your offerings with ease, and become a key part of every traveler's journey through Jharkhand.


        </p>
      </div>
    </section>

    {/* Features Section */}
    <section className="py-16 bg-white/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Our Platform?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We connect tourists with authentic local experiences while empowering communities
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Showcase Your Expertise</h3>
            <p className="text-gray-600">
              Get officially verified as a Jharkhand Tourism partner. Our platform highlights your local knowledge and skills, building trust with travelers and connecting you directly with customers looking for an authentic guide.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Reach a Global Audience</h3>
            <p className="text-gray-600">
              Whether you offer cultural tours, craft workshops, or adventure treks, we put your unique services in the spotlight. Stop waiting for customers to find you—let us bring them directly to your business.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Grow Your Business</h3>
            <p className="text-gray-600">
              Our verification process sets you apart from the competition. Becoming a state-approved vendor boosts your reputation and gives you the credibility and tools needed to increase your bookings and grow sustainably.
            </p>
          </div>
        </div>
      </div>
    </section>
  </>
);


function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const adminStatus = localStorage.getItem('isAdminLoggedIn');
    if (adminStatus === 'true') {
      setIsAdminLoggedIn(true);
    }
  }, []);

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('isAdminLoggedIn', 'true');
    navigate('/admin/dashboard');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/');
  };

  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/vendor/register" element={<div className="py-8"><VendorRegistration /></div>} />
        <Route path="/vendor/dashboard" element={<div className="py-8"><VendorDashboard /></div>} />
        <Route path="/admin/login" element={<AdminLogin onLogin={handleAdminLogin} />} />

        {/* Protected Admin Route */}
        <Route 
          path="/admin/dashboard" 
          element={
            isAdminLoggedIn ? (
              <AdminDashboard onLogout={handleAdminLogout} />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          } 
        />
      </Routes>
    </Layout>
  );
}

export default App;