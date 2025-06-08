import React, { useState } from 'react';
import { Search, Car, Clock, DollarSign, User, Phone, LogOut } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Vehicle {
  _id: string;
  vehicleType: string;
  vehicleNumber: string;
  customerName: string;
  phone: string;
  entryTime: string;
  isPrebooked: boolean;
  tokenNumber?: string;
}

const VehicleExit = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [exitLoading, setExitLoading] = useState(false);
  const [notes, setNotes] = useState('');

  const searchVehicles = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/vehicles?status=active&search=${searchTerm}`);
      const activeVehicles = response.data.data.vehicles.filter((v: Vehicle) => !v.exitTime);
      setVehicles(activeVehicles);
      
      if (activeVehicles.length === 0) {
        toast.error('No active vehicles found');
      }
    } catch (error) {
      toast.error('Failed to search vehicles');
    } finally {
      setLoading(false);
    }
  };

  const calculateBill = (entryTime: string, vehicleType: string) => {
    const entry = new Date(entryTime);
    const now = new Date();
    const timeDiff = now.getTime() - entry.getTime();
    const daysDiff = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));

    const rates = {
      bike: { day1: 10, additional: 15 },
      car: { day1: 30, additional: 45 },
      auto: { day1: 30, additional: 45 },
      van: { day1: 50, additional: 75 },
      bus: { day1: 50, additional: 75 },
      lorry: { day1: 50, additional: 75 }
    };

    const rate = rates[vehicleType as keyof typeof rates];
    if (!rate) return 0;

    const additionalDays = Math.max(0, daysDiff - 1);
    return rate.day1 + (additionalDays * rate.additional);
  };

  const handleVehicleExit = async () => {
    if (!selectedVehicle) return;

    setExitLoading(true);
    try {
      await api.put(`/vehicles/exit/${selectedVehicle._id}`, { notes });
      toast.success('Vehicle exit processed successfully!');
      
      // Reset state
      setSelectedVehicle(null);
      setVehicles([]);
      setSearchTerm('');
      setNotes('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to process vehicle exit';
      toast.error(message);
    } finally {
      setExitLoading(false);
    }
  };

  const getDuration = (entryTime: string) => {
    const entry = new Date(entryTime);
    const now = new Date();
    const diffMs = now.getTime() - entry.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
    }
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Exit</h1>
        <p className="text-gray-600">Process vehicle exit and generate bill</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Search Active Vehicle</h2>
        <div className="flex space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by vehicle number, customer name, or phone"
              onKeyPress={(e) => e.key === 'Enter' && searchVehicles()}
            />
          </div>
          <button
            onClick={searchVehicles}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Search Results */}
      {vehicles.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Active Vehicles</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedVehicle?._id === vehicle._id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedVehicle(vehicle)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Car className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {vehicle.vehicleNumber} ({vehicle.vehicleType})
                        </h3>
                        <p className="text-sm text-gray-600">
                          Customer: {vehicle.customerName}
                        </p>
                        <p className="text-sm text-gray-500">
                          Phone: {vehicle.phone}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Entry: {new Date(vehicle.entryTime).toLocaleString()}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        Duration: {getDuration(vehicle.entryTime)}
                      </p>
                      {vehicle.isPrebooked && (
                        <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Pre-booked
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Exit Processing */}
      {selectedVehicle && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Process Exit</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Vehicle Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Vehicle Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Car className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">
                      {selectedVehicle.vehicleNumber} ({selectedVehicle.vehicleType})
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{selectedVehicle.customerName}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{selectedVehicle.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">
                      {new Date(selectedVehicle.entryTime).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Billing Details */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">Billing Details</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{getDuration(selectedVehicle.entryTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vehicle Type:</span>
                      <span className="font-medium capitalize">{selectedVehicle.vehicleType}</span>
                    </div>
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total Amount:</span>
                        <span className="text-green-600">
                          ₹{calculateBill(selectedVehicle.entryTime, selectedVehicle.vehicleType)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Add any additional notes..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button
                onClick={handleVehicleExit}
                disabled={exitLoading}
                className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {exitLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing Exit...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <LogOut className="w-5 h-5 mr-2" />
                    Process Exit & Generate Bill
                  </div>
                )}
              </button>
              
              <button
                onClick={() => {
                  setSelectedVehicle(null);
                  setNotes('');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleExit;