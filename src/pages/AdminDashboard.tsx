import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import AdminStats from '../components/admin/AdminStats';
import UserManagement from '../components/admin/UserManagement';
import VehicleLog from '../components/admin/VehicleLog';
import PrebookingManagement from '../components/admin/PrebookingManagement';
import Reports from '../components/admin/Reports';
import ComingSoon from '../components/admin/ComingSoon';
import api from '../services/api';
import toast from 'react-hot-toast';

type MenuIcon = 'BarChart3' | 'Car' | 'Calendar' | 'Users' | 'FileText' | 'CreditCard' | 'Zap';

interface MenuItem {
  name: string;
  path: string;
  icon: MenuIcon;
  comingSoon?: boolean;
}

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setDashboardData(response.data.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', path: '/admin', icon: 'BarChart3' },
    { name: 'Vehicle Log', path: '/admin/vehicles', icon: 'Car' },
    { name: 'Prebookings', path: '/admin/prebookings', icon: 'Calendar' },
    { name: 'User Management', path: '/admin/users', icon: 'Users' },
    { name: 'Reports', path: '/admin/reports', icon: 'FileText' },
    { name: 'Subscriptions', path: '/admin/subscriptions', icon: 'CreditCard', comingSoon: true },
    { name: 'EV Charging', path: '/admin/ev-charging', icon: 'Zap', comingSoon: true },
  ];

  return (
    <DashboardLayout
      title="Admin Dashboard"
      menuItems={menuItems}
    >
      <Routes>
        <Route 
          path="/" 
          element={
            <AdminStats 
              data={dashboardData} 
              loading={loading} 
              onRefresh={fetchDashboardData}
            />
          } 
        />
        <Route path="/vehicles" element={<VehicleLog />} />
        <Route path="/prebookings" element={<PrebookingManagement />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/subscriptions" element={<ComingSoon feature="Subscriptions" />} />
        <Route path="/ev-charging" element={<ComingSoon feature="EV Charging Stations" />} />
      </Routes>
    </DashboardLayout>
  );
};

export default AdminDashboard;