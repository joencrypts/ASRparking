import express from 'express';
import Prebooking from '../models/Prebooking.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendWhatsAppMessage } from '../services/whatsapp.js';

const router = express.Router();

// Create prebooking (User only)
router.post('/', authenticate, authorize('user'), asyncHandler(async (req, res) => {
  const { vehicleType, vehicleNumber, name, phone, scheduledTime } = req.body;

  // Validate scheduled time (must be at least 1 hour from now)
  const minScheduledTime = new Date(Date.now() + 60 * 60 * 1000);
  if (new Date(scheduledTime) < minScheduledTime) {
    return res.status(400).json({
      success: false,
      message: 'Scheduled time must be at least 1 hour from now'
    });
  }

  const prebooking = new Prebooking({
    userId: req.user._id,
    vehicleType,
    vehicleNumber: vehicleNumber.toUpperCase(),
    name,
    phone,
    scheduledTime: new Date(scheduledTime)
  });

  await prebooking.save();
  await prebooking.populate('userId', 'name email');

  // Send WhatsApp confirmation
  try {
    const message = `Hi ${name}, your booking at ASR Parking Lot is confirmed. Your token number is: ${prebooking.tokenNumber}. Show this token at entry. Thank you!`;
    await sendWhatsAppMessage(phone, message);
    
    prebooking.whatsappSent = true;
    await prebooking.save();
  } catch (error) {
    console.error('WhatsApp notification failed:', error);
  }

  res.status(201).json({
    success: true,
    message: 'Prebooking created successfully',
    data: { prebooking }
  });
}));

// Get user's prebookings
router.get('/my-bookings', authenticate, authorize('user'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const filter = { userId: req.user._id };
  
  if (status) {
    filter.status = status;
  }

  const prebookings = await Prebooking.find(filter)
    .populate('verifiedBy', 'name')
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

// Verify token (Staff only)
router.get('/verify/:tokenNumber', authenticate, authorize('staff', 'admin'), asyncHandler(async (req, res) => {
  const { tokenNumber } = req.params;

  const prebooking = await Prebooking.findOne({ 
    tokenNumber,
    status: 'pending'
  }).populate('userId', 'name email phone');

  if (!prebooking) {
    return res.status(404).json({
      success: false,
      message: 'Invalid or expired token number'
    });
  }

  // Check if booking is for today or future
  const today = new Date();
  const bookingDate = new Date(prebooking.scheduledTime);
  
  if (bookingDate.toDateString() !== today.toDateString() && bookingDate < today) {
    return res.status(400).json({
      success: false,
      message: 'Booking has expired'
    });
  }

  res.json({
    success: true,
    data: { prebooking }
  });
}));

// Get all prebookings (Staff and Admin)
router.get('/', authenticate, authorize('staff', 'admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, date } = req.query;

  const filter = {};
  
  if (status) {
    filter.status = status;
  }

  if (date) {
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1);
    
    filter.scheduledTime = {
      $gte: startDate,
      $lt: endDate
    };
  }

  const prebookings = await Prebooking.find(filter)
    .populate('userId', 'name email phone')
    .populate('verifiedBy', 'name')
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

// Cancel prebooking
router.put('/cancel/:id', authenticate, asyncHandler(async (req, res) => {
  const { id } = req.params;

  const prebooking = await Prebooking.findById(id);

  if (!prebooking) {
    return res.status(404).json({
      success: false,
      message: 'Prebooking not found'
    });
  }

  // Users can only cancel their own bookings
  if (req.user.role === 'user' && prebooking.userId.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  if (prebooking.status !== 'pending') {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel this booking'
    });
  }

  prebooking.status = 'cancelled';
  await prebooking.save();

  res.json({
    success: true,
    message: 'Prebooking cancelled successfully',
    data: { prebooking }
  });
}));

export default router;