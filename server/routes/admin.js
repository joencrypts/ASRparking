import express from 'express';
import User from '../models/User.js';
import VehicleEntry from '../models/VehicleEntry.js';  
import Prebooking from '../models/Prebooking.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendWhatsAppMessage } from '../services/whatsapp.js';

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Today's statistics
  const [
    todayVehicles,
    todayIncome,
    activeVehicles,
    totalUsers,
    totalStaff,
    todayPrebookings
  ] = await Promise.all([
    VehicleEntry.countDocuments({
      entryTime: { $gte: today, $lt: tomorrow }
    }),
    VehicleEntry.aggregate([
      {
        $match: {
          exitTime: { $gte: today, $lt: tomorrow },
          isPaid: true
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$billAmount' }
        }
      }
    ]),
    VehicleEntry.countDocuments({
      exitTime: { $exists: false }
    }),
    User.countDocuments({ role: 'user', isActive: true }),
    User.countDocuments({ role: 'staff', isActive: true }),
    Prebooking.countDocuments({
      scheduledTime: { $gte: today, $lt: tomorrow }
    })
  ]);

  // Weekly revenue chart data
  const weeklyRevenue = await VehicleEntry.aggregate([
    {
      $match: {
        exitTime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        isPaid: true
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$exitTime' }
        },
        revenue: { $sum: '$billAmount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Vehicle type distribution
  const vehicleDistribution = await VehicleEntry.aggregate([
    {
      $match: {
        entryTime: { $gte: today, $lt: tomorrow }
      }
    },
    {
      $group: {
        _id: '$vehicleType',
        count: { $sum: 1 }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      todayStats: {
        vehicles: todayVehicles,
        income: todayIncome[0]?.total || 0,
        activeVehicles,
        prebookings: todayPrebookings
      },
      overallStats: {
        totalUsers,
        totalStaff
      },
      charts: {
        weeklyRevenue,
        vehicleDistribution
      }
    }
  });
}));

// Get all users
router.get('/users', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, role, search } = req.query;

  const filter = {};
  
  if (role) {
    filter.role = role;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(filter)
    .populate('createdBy', 'name')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await User.countDocuments(filter);

  res.json({
    success: true,
    data: {
      users,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// Create staff user
router.post('/users', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { name, email, phone, password, role = 'staff' } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: existingUser.email === email 
        ? 'Email already registered' 
        : 'Phone number already registered'
    });
  }

  // Create new user
  const user = new User({
    name,
    email,
    phone,
    passwordHash: password,
    role,
    createdBy: req.user._id
  });

  await user.save();
  await user.populate('createdBy', 'name');

  res.status(201).json({
    success: true,
    message: `${role} user created successfully`,
    data: { user }
  });
}));

// Update user status
router.put('/users/:id/status', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Prevent admin from deactivating themselves
  if (user._id.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: 'Cannot modify your own account status'
    });
  }

  user.isActive = isActive;
  await user.save();

  res.json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: { user }
  });
}));

// Export data (CSV format)
router.get('/export/:type', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { startDate, endDate } = req.query;

  let data;
  let filename;
  let headers;

  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  switch (type) {
    case 'vehicles':
      data = await VehicleEntry.find(dateFilter)
        .populate('addedBy', 'name')
        .sort({ entryTime: -1 });
      
      filename = `vehicles-${Date.now()}.csv`;
      headers = 'Vehicle Type,Vehicle Number,Customer Name,Phone,Entry Time,Exit Time,Bill Amount,Is Paid,Added By\n';
      
      const vehicleRows = data.map(v => 
        `${v.vehicleType},${v.vehicleNumber},${v.customerName},${v.phone},${v.entryTime},${v.exitTime || ''},${v.billAmount || ''},${v.isPaid},${v.addedBy?.name || ''}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(headers + vehicleRows);
      break;

    case 'prebookings':
      data = await Prebooking.find(dateFilter)
        .populate('userId', 'name email')
        .sort({ scheduledTime: -1 });
      
      filename = `prebookings-${Date.now()}.csv`;
      headers = 'Token Number,Vehicle Type,Vehicle Number,Name,Phone,Scheduled Time,Status,User Email\n';
      
      const bookingRows = data.map(b => 
        `${b.tokenNumber},${b.vehicleType},${b.vehicleNumber},${b.name},${b.phone},${b.scheduledTime},${b.status},${b.userId?.email || ''}`
      ).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(headers + bookingRows);
      break;

    default:
      return res.status(400).json({
        success: false,
        message: 'Invalid export type'
      });
  }
}));

// Test WhatsApp configuration
router.post('/test-whatsapp', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { phone, useTemplate = true } = req.body;
  
  if (!phone) {
    return res.status(400).json({
      success: false,
      message: 'Phone number is required'
    });
  }

  let result;
  if (useTemplate) {
    // Test with template
    result = await sendWhatsAppMessage(phone, null, {
      "1": "Test Vehicle",
      "2": "Test Token"
    });
  } else {
    // Test with direct message
    result = await sendWhatsAppMessage(phone, 'This is a test message from ASR Parking System');
  }
  
  res.json({
    success: result.success,
    message: result.success 
      ? 'WhatsApp test message sent successfully' 
      : 'Failed to send WhatsApp message',
    details: result
  });
}));

// Clear vehicle entries
router.delete('/vehicles/clear', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { date } = req.query;
  const { confirmation } = req.body;

  if (confirmation !== 'CLEAR_ALL_VEHICLES') {
    return res.status(400).json({
      success: false,
      message: 'Invalid confirmation'
    });
  }

  // Build query based on date if provided
  const query = {};
  if (date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    query.entryTime = { $gte: startDate, $lte: endDate };
  }

  // Get count before deletion
  const totalCount = await VehicleEntry.countDocuments(query);

  // Delete entries
  const result = await VehicleEntry.deleteMany(query);

  res.json({
    success: true,
    data: {
      deletedCount: result.deletedCount,
      totalCount
    }
  });
}));

// Get vehicle entries statistics before clearing
router.get('/vehicles/stats', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { date } = req.query;
  
  let query = {};
  
  // If date is provided, get stats for that date
  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    query.entryTime = {
      $gte: startDate,
      $lt: endDate
    };
  }

  const stats = await VehicleEntry.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalEntries: { $sum: 1 },
        totalRevenue: { $sum: '$billAmount' },
        activeVehicles: {
          $sum: {
            $cond: [{ $eq: ['$exitTime', null] }, 1, 0]
          }
        }
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      totalEntries: stats[0]?.totalEntries || 0,
      totalRevenue: stats[0]?.totalRevenue || 0,
      activeVehicles: stats[0]?.activeVehicles || 0
    }
  });
}));

// Clear prebooking entries
router.delete('/prebookings/clear', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { date } = req.query;
  const { confirmation } = req.body;

  if (confirmation !== 'CLEAR_ALL_PREBOOKINGS') {
    return res.status(400).json({
      success: false,
      message: 'Invalid confirmation'
    });
  }

  // Build query based on date if provided
  const query = {};
  if (date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    query.scheduledTime = { $gte: startDate, $lte: endDate };
  }

  // Get count before deletion
  const totalCount = await Prebooking.countDocuments(query);

  // Delete entries
  const result = await Prebooking.deleteMany(query);

  res.json({
    success: true,
    data: {
      deletedCount: result.deletedCount,
      totalCount
    }
  });
}));

// Get all prebookings
router.get('/prebookings', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, search } = req.query;

  const filter = {};
  
  if (status && status !== 'all') {
    filter.status = status;
  }

  if (search) {
    filter.$or = [
      { vehicleNumber: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const prebookings = await Prebooking.find(filter)
    .populate('addedBy', 'name')
    .sort({ scheduledTime: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Prebooking.countDocuments(filter);

  res.json({
    success: true,
    data: {
      prebookings,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

export default router;