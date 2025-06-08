import React, { useState } from 'react';
import { Car, Calendar, Clock, User, Phone, Hash } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';
import toast from 'react-hot-toast';

const BookParking = () => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    vehicleType: '',
    vehicleNumber: '',
    name: user?.name || '',
    phone: user?.phone || '',
    scheduledTime: ''
  });
  const [loading, setLoading] = useState(false);

  const vehicleTypes = [
    { value: 'bike', label: 'Bike', rate: '₹10/day' },
    { value: 'car', label: 'Car', rate: '₹30/day' },
    { value: 'auto', label: 'Auto', rate: '₹30/day' },
    { value: 'van', label: 'Van', rate: '₹50/day' },
    { value: 'bus', label: 'Bus', rate: '₹50/day' },
    { value: 'lorry', label: 'Lorry', rate: '₹50/day' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/prebooking', {
        ...formData,
        vehicleNumber: formData.vehicleNumber.toUpperCase()
      });

      const { prebooking } = response.data.data;
      
      toast.success('Booking created successfully!');
      
      // Reset form
      setFormData({
        vehicleType: '',
        vehicleNumber: '',
        name: user?.name || '',
        phone: user?.phone || '',
        scheduledTime: ''
      });

      // Show token in a modal or alert
      alert(`Booking confirmed! Your token number is: ${prebooking.tokenNumber}`);
      
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create booking';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date/time (1 hour from now)
  const getMinDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    return now.toISOString().slice(0, 16);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Book Parking Slot</h1>
          <p className="text-gray-600 mt-2">Reserve your parking space in advance</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
            >
              <option value="">Select vehicle type</option>
              {vehicleTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.rate}
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
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter customer name"
                required
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
              />
            </div>
          </div>

          {/* Scheduled Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheduled Entry Time
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="datetime-local"
                name="scheduledTime"
                value={formData.scheduledTime}
                onChange={handleInputChange}
                min={getMinDateTime()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Booking must be at least 1 hour in advance
            </p>
          </div>

          {/* Billing Information */}
          {formData.vehicleType && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Billing Information</h3>
              <div className="text-sm text-blue-800">
                {(() => {
                  const selectedType = vehicleTypes.find(t => t.value === formData.vehicleType);
                  return selectedType ? (
                    <div>
                      <p>Vehicle Type: {selectedType.label}</p>
                      <p>Rate: {selectedType.rate}</p>
                      <p className="mt-2 text-xs">
                        Additional days will be charged at higher rates. 
                        Final bill will be calculated at exit.
                      </p>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Booking...
              </div>
            ) : (
              'Book Parking Slot'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookParking;