import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, Clock, Smartphone, Users, BarChart3 } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                <img src="/logo.png" alt="ASR Parking Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ASR Parking</h1>
                <p className="text-sm text-gray-500">Smart Parking Solutions</p>
              </div>
            </div>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Modern Parking
            <span className="text-blue-600 block">Management System</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Streamline your parking operations with our comprehensive management system. 
            Handle bookings, track vehicles, and manage payments all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              Get Started
            </Link>
              </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h3>
            <p className="text-xl text-gray-600">
              Powerful features designed for modern parking management
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <Car className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Vehicle Tracking</h4>
              <p className="text-gray-600">
                Track all vehicle entries and exits with automatic billing based on duration and vehicle type.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200">
              <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Pre-booking System</h4>
              <p className="text-gray-600">
                Allow customers to book parking slots in advance with unique token generation for easy verification.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">WhatsApp Notifications</h4>
              <p className="text-gray-600">
                Automatic WhatsApp notifications for booking confirmations and billing updates.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Role-based Access</h4>
              <p className="text-gray-600">
                Separate dashboards for Admin, Staff, and Users with appropriate permissions and features.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Analytics Dashboard</h4>
              <p className="text-gray-600">
                Comprehensive analytics with revenue tracking, vehicle statistics, and exportable reports.
              </p>
            </div>

            <div className="p-8 rounded-xl bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Secure & Reliable</h4>
              <p className="text-gray-600">
                Built with security best practices, data encryption, and reliable backup systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Parking Management?
          </h3>
          <p className="text-xl text-gray-600 mb-8">
            Join hundreds of parking facilities already using ASR Parking System
          </p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg inline-block"
          >
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img src="/logo.png" alt="ASR Parking Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">ASR Parking</h1>
              <p className="text-sm text-gray-400">Smart Parking Solutions</p>
            </div>
          </div>
          <div className="text-center text-gray-400">
            <p>&copy; 2025 ASR Parking Lot. All rights reserved.</p>
            <p className="mt-2">Built with ❤️ @joencrypts</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;