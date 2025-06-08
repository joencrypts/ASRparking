import React from 'react';
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import UserHome from '../components/user/UserHome';
import BookParking from '../components/user/BookParking';
import MyBookings from '../components/user/MyBookings';
import Profile from '../components/user/Profile';

const UserDashboard = () => {
  const menuItems = [
    { name: 'Dashboard', path: '/user', icon: 'Home' },
    { name: 'Book Parking', path: '/user/book', icon: 'Calendar' },
    { name: 'My Bookings', path: '/user/bookings', icon: 'Clock' },
    { name: 'Profile', path: '/user/profile', icon: 'User' },
  ];

  return (
    <DashboardLayout
      title="User Dashboard"
      menuItems={menuItems}
    >
      <Routes>
        <Route path="/" element={<UserHome />} />
        <Route path="/book" element={<BookParking />} />
        <Route path="/bookings" element={<MyBookings />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </DashboardLayout>
  );
};

export default UserDashboard;