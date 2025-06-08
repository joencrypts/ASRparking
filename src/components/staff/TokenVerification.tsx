import React, { useState } from 'react';
import { Shield, Search, User, Car, Calendar, Clock, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Prebooking {
  _id: string;
  vehicleType: string;
  vehicleNumber: string;
  name: string;
  phone: string;
  scheduledTime: string;
  tokenNumber: string;
  userId: {
    name: string;
    email: string;
    phone: string;
  };
}

const TokenVerification = () => {
  const [tokenNumber, setTokenNumber] = useState('');
  const [prebooking, setPrebooking] = useState<Prebooking | null>(null);
  const [loading, setLoading] = useState(false);

  const verifyToken = async () => {
    if (!tokenNumber.trim()) {
      toast.error('Please enter a token number');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/prebooking/verify/${tokenNumber}`);
      setPrebooking(response.data.data.prebooking);
      toast.success('Token verified successfully!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Invalid or expired token';
      toast.error(message);
      setPrebooking(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      verifyToken();
    }
  };

  const resetForm = () => {
    setTokenNumber('');
    setPrebooking(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Token Verification</h1>
        <p className="text-gray-600">Verify pre-booking tokens before vehicle entry</p>
      </div>

      {/* Token Input */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter Token Number</h2>
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={tokenNumber}
              onChange={(e) => setTokenNumber(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
              placeholder="Enter token number (e.g., ASR123456)"
            />
          </div>
          <button
            onClick={verifyToken}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Verifying...
              </div>
            ) : (
              <div className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                Verify
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Verification Result */}
      {prebooking && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Token Verified Successfully</h2>
                <p className="text-green-600">Pre-booking details found</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Booking Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Booking Details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-600">Token Number</span>
                      <p className="font-mono font-medium">{prebooking.tokenNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Car className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-600">Vehicle</span>
                      <p className="font-medium">
                        {prebooking.vehicleNumber} ({prebooking.vehicleType})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-600">Scheduled Date</span>
                      <p className="font-medium">
                        {new Date(prebooking.scheduledTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-600">Scheduled Time</span>
                      <p className="font-medium">
                        {new Date(prebooking.scheduledTime).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900 border-b pb-2">Customer Details</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <span className="text-sm text-gray-600">Customer Name</span>
                      <p className="font-medium">{prebooking.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <span className="text-gray-400">📱</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Phone Number</span>
                      <p className="font-medium">{prebooking.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <span className="text-gray-400">✉️</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Email</span>
                      <p className="font-medium">{prebooking.userId.email}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex space-x-4">
              <button
                onClick={() => {
                  // Navigate to vehicle entry with pre-filled data
                  window.location.href = `/staff/entry?token=${prebooking.tokenNumber}`;
                }}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 font-medium"
              >
                Proceed to Vehicle Entry
              </button>
              
              <button
                onClick={resetForm}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Verify Another Token
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-medium text-blue-900 mb-2">Instructions</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Enter the token number provided by the customer</li>
          <li>• Verify the vehicle and customer details match</li>
          <li>• Proceed to vehicle entry if everything is correct</li>
          <li>• Contact customer if there are any discrepancies</li>
        </ul>
      </div>
    </div>
  );
};

export default TokenVerification;