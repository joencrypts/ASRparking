import React, { useState } from 'react';
import { Car, User, Phone, Hash, Shield, Plus } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VehicleEntry = () => {
  const [formData, setFormData] = useState({
    vehicleType: '',
    vehicleNumber: '',
    customerName: '',
    phone: '',
    tokenNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [isPrebooked, setIsPrebooked] = useState(false);

  const vehicleTypes = [
    { value: 'bike', label: 'Bike' },
    { value: 'car', label: 'Car' },
    { value: 'auto', label: 'Auto' },
    { value: 'van', label: 'Van' },
    { value: 'bus', label: 'Bus' },
    { value: 'lorry', label: 'Lorry' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleTokenVerification = async () => {
    if (!formData.tokenNumber) {
      toast.error('Please enter a token number');
      return;
    }

    try {
      const response = await api.get(`/prebooking/verify/${formData.tokenNumber}`);
      const { prebooking } = response.data.data;
      
      setFormData(prev => ({
        ...prev,
        vehicleType: prebooking.vehicleType,
        vehicleNumber: prebooking.vehicleNumber,
        customerName: prebooking.name,
        phone: prebooking.phone
      }));
      
      setIsPrebooked(true);
      toast.success('Token verified successfully!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid token number';
      toast.error(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/vehicles/entry', {
        ...formData,
        vehicleNumber: formData.vehicleNumber.toUpperCase(),
        tokenNumber: isPrebooked ? formData.tokenNumber : undefined
      });

      toast.success('Vehicle entry added successfully!');
      
      // Reset form
      setFormData({
        vehicleType: '',
        vehicleNumber: '',
        customerName: '',
        phone: '',
        tokenNumber: ''
      });
      setIsPrebooked(false);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add vehicle entry';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      vehicleType: '',
      vehicleNumber: '',
      customerName: '',
      phone: '',
      tokenNumber: ''
    });
    setIsPrebooked(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Vehicle Entry</h1>
          <p className="text-gray-600 mt-2">Add a new vehicle to the parking lot</p>
        </div>

        <div className="p-6">
          {/* Token Verification Section */}
          <div className="mb-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-3">Pre-booking Verification</h3>
            <div className="flex space-x-3">
              <div className="flex-1">
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="tokenNumber"
                    value={formData.tokenNumber}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter token number (optional)"
                    disabled={isPrebooked}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleTokenVerification}
                disabled={!formData.tokenNumber || isPrebooked}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify
              </button>
              {isPrebooked && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
            {isPrebooked && (
              <p className="text-sm text-green-600 mt-2">✓ Pre-booking verified! Details auto-filled.</p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vehicle Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type
              </label>
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isPrebooked}
              >
                <option value="">Select vehicle type</option>
                {vehicleTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Number
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                  placeholder="e.g., KA01AB1234"
                  required
                  disabled={isPrebooked}
                />
              </div>
            </div>

            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer name"
                  required
                  disabled={isPrebooked}
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter phone number"
                  pattern="[6-9]\d{9}"
                  required
                  disabled={isPrebooked}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Adding Entry...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Plus className="w-5 h-5 mr-2" />
                  Add Vehicle Entry
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleEntry;