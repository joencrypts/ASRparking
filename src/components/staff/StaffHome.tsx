import React, { useState, useEffect } from 'react';
import { Car, LogIn, LogOut, Shield, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface DashboardStats {
  todayEntries: number;
  activeVehicles: number;
  todayExits: number;
  pendingVerifications: number;
}

const StaffHome = () => {
  const [stats, setStats] = useState<DashboardStats>({
    todayEntries: 0,
    activeVehicles: 0,
    todayExits: 0,
    pendingVerifications: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch today's vehicle entries
      const today = new Date().toISOString().split('T')[0];
      const [vehiclesResponse, prebookingsResponse] = await Promise.all([
        api.get(`/vehicles?page=1&limit=5`),
        api.get(`/prebooking?date=${today}&limit=5`)
      ]);

      const vehicles = vehiclesResponse.data.data.vehicles;
      const prebookings = prebookingsResponse.data.data.prebookings;

      // Calculate stats
      const todayVehicles = vehicles.filter((v: any) => 
        new Date(v.entryTime).toDateString() === new Date().toDateString()
      );

      setStats({
        todayEntries: todayVehicles.length,
        activeVehicles: vehicles.filter((v: any) => !v.exitTime).length,
        todayExits: vehicles.filter((v: any) => 
          v.exitTime && new Date(v.exitTime).toDateString() === new Date().toDateString()
        ).length,
        pendingVerifications: prebookings.filter((p: any) => p.status === 'pending').length
      });

      setRecentActivity(vehicles.slice(0, 5));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Staff Dashboard</h1>
        <p className="text-teal-100">Manage vehicle entries, exits, and token verifications</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Entries</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayEntries}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <LogIn className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeVehicles}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Car className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Exits</p>
              <p className="text-2xl font-bold text-gray-900">{stats.todayExits}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <LogOut className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Tokens</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingVerifications}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/staff/entry"
            className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <LogIn className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Vehicle Entry</h3>
              <p className="text-sm text-gray-600">Add new vehicle</p>
            </div>
          </Link>

          <Link
            to="/staff/exit"
            className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <LogOut className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Vehicle Exit</h3>
              <p className="text-sm text-gray-600">Process exit & billing</p>
            </div>
          </Link>

          <Link
            to="/staff/verify"
            className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Verify Token</h3>
              <p className="text-sm text-gray-600">Check prebooking</p>
            </div>
          </Link>

          <Link
            to="/staff/vehicles"
            className="flex items-center space-x-3 p-4 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
          >
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Vehicle Log</h3>
              <p className="text-sm text-gray-600">View all vehicles</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Link
              to="/staff/vehicles"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
        </div>

        <div className="p-6">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
              <p className="text-gray-600">Vehicle entries and exits will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivity.map((vehicle: any) => (
                <div
                  key={vehicle._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Car className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {vehicle.vehicleNumber} ({vehicle.vehicleType})
                      </h4>
                      <p className="text-sm text-gray-600">
                        Customer: {vehicle.customerName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Entry: {new Date(vehicle.entryTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {vehicle.exitTime ? (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Exited</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-orange-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">Active</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffHome;