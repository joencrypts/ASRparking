import React, { useState, useEffect } from 'react';
import { Car, Search, Filter, Eye, LogOut, DollarSign, Clock } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

interface Vehicle {
  _id: string;
  vehicleType: string;
  vehicleNumber: string;
  customerName: string;
  phone: string;
  entryTime: string;
  exitTime?: string;
  billAmount?: number;
  isPaid: boolean;
  isPrebooked: boolean;
  tokenNumber?: string;
  addedBy: {
    name: string;
  };
}

const VehicleLog = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchVehicles();
  }, [page, statusFilter, vehicleTypeFilter]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (vehicleTypeFilter !== 'all') {
        params.append('vehicleType', vehicleTypeFilter);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await api.get(`/vehicles?${params}`);
      const { vehicles, pagination } = response.data.data;
      
      setVehicles(vehicles);
      setTotalPages(pagination.pages);
    } catch (error) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchVehicles();
  };

  const handleMarkPaid = async (vehicleId: string) => {
    try {
      await api.put(`/vehicles/payment/${vehicleId}`);
      toast.success('Payment marked as completed');
      fetchVehicles();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to mark payment';
      toast.error(message);
    }
  };

  const getStatusBadge = (vehicle: Vehicle) => {
    if (!vehicle.exitTime) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Active
        </span>
      );
    } else if (!vehicle.isPaid) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Pending Payment
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Completed
        </span>
      );
    }
  };

  const getDuration = (entryTime: string, exitTime?: string) => {
    const entry = new Date(entryTime);
    const exit = exitTime ? new Date(exitTime) : new Date();
    const diffMs = exit.getTime() - entry.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;

    if (diffDays > 0) {
      return `${diffDays}d ${remainingHours}h`;
    }
    return `${diffHours}h`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Log</h1>
        <p className="text-gray-600">View and manage all vehicle entries and exits</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by vehicle number, customer name, or phone"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="exited">Exited</option>
            </select>
          </div>

          {/* Vehicle Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Type
            </label>
            <select
              value={vehicleTypeFilter}
              onChange={(e) => {
                setVehicleTypeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="bike">Bike</option>
              <option value="car">Car</option>
              <option value="auto">Auto</option>
              <option value="van">Van</option>
              <option value="bus">Bus</option>
              <option value="lorry">Lorry</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vehicle List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Entry Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bill
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <Car className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {vehicle.vehicleNumber}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                              {vehicle.vehicleType}
                              {vehicle.isPrebooked && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  Pre-booked
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {vehicle.customerName}
                        </div>
                        <div className="text-sm text-gray-500">{vehicle.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(vehicle.entryTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {getDuration(vehicle.entryTime, vehicle.exitTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(vehicle)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {vehicle.billAmount ? (
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                            ₹{vehicle.billAmount}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {!vehicle.exitTime && (
                            <button
                              onClick={() => window.location.href = '/staff/exit'}
                              className="text-orange-600 hover:text-orange-900"
                              title="Process Exit"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                          )}
                          {vehicle.exitTime && !vehicle.isPaid && (
                            <button
                              onClick={() => handleMarkPaid(vehicle._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Mark as Paid"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="text-sm text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default VehicleLog;