import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StaffHome from '../components/staff/StaffHome';
import VehicleEntry from '../components/staff/VehicleEntry';
import VehicleExit from '../components/staff/VehicleExit';
import TokenVerification from '../components/staff/TokenVerification';
import VehicleLog from '../components/staff/VehicleLog';

const StaffDashboard = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/staff', icon: 'Home' },
    { name: 'Vehicle Entry', path: '/staff/entry', icon: 'LogIn' },
    { name: 'Vehicle Exit', path: '/staff/exit', icon: 'LogOut' },
    { name: 'Verify Token', path: '/staff/verify', icon: 'Shield' },
    { name: 'Vehicle Log', path: '/staff/vehicles', icon: 'List' },
  ];

  return (
    <DashboardLayout
      title="Staff Dashboard"
      menuItems={menuItems}
    >
      <Routes>
        <Route path="/" element={<StaffHome />} />
        <Route path="/entry" element={<VehicleEntry />} />
        <Route path="/exit" element={<VehicleExit />} />
        <Route path="/verify" element={<TokenVerification />} />
        <Route path="/vehicles" element={<VehicleLog />} />
      </Routes>
    </DashboardLayout>
  );
};

export default StaffDashboard;