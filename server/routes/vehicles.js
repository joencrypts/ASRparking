import express from 'express';
import VehicleEntry from '../models/VehicleEntry.js';
import Prebooking from '../models/Prebooking.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sendWhatsAppMessage } from '../services/whatsapp.js';

const router = express.Router();

// Add vehicle entry (Staff only)
router.post('/entry', authenticate, authorize('staff', 'admin'), asyncHandler(async (req, res) => {
  const { vehicleType, vehicleNumber, customerName, phone, tokenNumber } = req.body;

  // Check if it's a prebooking
  let isPrebooked = false;
  let prebooking = null;

  if (tokenNumber) {
    prebooking = await Prebooking.findOne({ 
      tokenNumber, 
      status: 'pending'
    }).populate('userId');

    if (!prebooking) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token number'
      });
    }

    isPrebooked = true;
    
    // Update prebooking status
    prebooking.status = 'verified';
    prebooking.verifiedBy = req.user._id;
    prebooking.verificationTime = new Date();
    await prebooking.save();
  }

  // Create vehicle entry
  const vehicleEntry = new VehicleEntry({
    vehicleType,
    vehicleNumber: vehicleNumber.toUpperCase(),
    customerName: isPrebooked ? prebooking.name : customerName,
    phone: isPrebooked ? prebooking.phone : phone,
    addedBy: req.user._id,
    isPrebooked,
    tokenNumber: isPrebooked ? tokenNumber : undefined
  });

  await vehicleEntry.save();
  await vehicleEntry.populate('addedBy', 'name');

  res.status(201).json({
    success: true,
    message: 'Vehicle entry added successfully',
    data: { vehicleEntry }
  });
}));

// Vehicle exit and billing (Staff only)
router.put('/exit/:id', authenticate, authorize('staff', 'admin'), asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { notes } = req.body;

  const vehicleEntry = await VehicleEntry.findById(id);

  if (!vehicleEntry) {
    return res.status(404).json({
      success: false,
      message: 'Vehicle entry not found'
    });
  }

  if (vehicleEntry.exitTime) {
    return res.status(400).json({
      success: false,
      message: 'Vehicle has already exited'
    });
  }

  // Set exit time and calculate bill
  vehicleEntry.exitTime = new Date();
  vehicleEntry.billAmount = vehicleEntry.calculateBill();
  vehicleEntry.notes = notes;

  await vehicleEntry.save();

  // Send WhatsApp notification
  try {
    await sendWhatsAppMessage(
      vehicleEntry.phone,
      `Hi ${vehicleEntry.customerName}, your vehicle ${vehicleEntry.vehicleNumber} has exited ASR Parking Lot. Your final bill: ₹${vehicleEntry.billAmount}. Thanks for visiting!`
    );
  } catch (error) {
    console.error('WhatsApp notification failed:', error);
  }

  res.json({
    success: true,
    message: 'Vehicle exit processed successfully',
    data: { vehicleEntry }
  });
}));

// Mark bill as paid (Staff only)
router.put('/payment/:id', authenticate, authorize('staff', 'admin'), asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vehicleEntry = await VehicleEntry.findById(id);

  if (!vehicleEntry) {
    return res.status(404).json({
      success: false,
      message: 'Vehicle entry not found'
    });
  }

  if (!vehicleEntry.exitTime) {
    return res.status(400).json({
      success: false,
      message: 'Vehicle has not exited yet'
    });
  }

  vehicleEntry.isPaid = true;
  vehicleEntry.paymentTime = new Date();
  await vehicleEntry.save();

  res.json({
    success: true,
    message: 'Payment marked as completed',
    data: { vehicleEntry }
  });
}));

// Get all vehicle entries (Staff and Admin)
router.get('/', authenticate, authorize('staff', 'admin'), asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, vehicleType, search } = req.query;

  const filter = {};
  
  if (status === 'active') {
    filter.exitTime = { $exists: false };
  } else if (status === 'exited') {
    filter.exitTime = { $exists: true };
  }

  if (vehicleType) {
    filter.vehicleType = vehicleType;
  }

  if (search) {
    filter.$or = [
      { vehicleNumber: { $regex: search, $options: 'i' } },
      { customerName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  const vehicles = await VehicleEntry.find(filter)
    .populate('addedBy', 'name')
    .sort({ entryTime: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await VehicleEntry.countDocuments(filter);

  res.json({
    success: true,
    data: {
      vehicles,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    }
  });
}));

// Get vehicle entry details
router.get('/:id', authenticate, authorize('staff', 'admin'), asyncHandler(async (req, res) => {
  const vehicle = await VehicleEntry.findById(req.params.id)
    .populate('addedBy', 'name email');

  if (!vehicle) {
    return res.status(404).json({
      success: false,
      message: 'Vehicle entry not found'
    });
  }

  res.json({
    success: true,
    data: { vehicle }
  });
}));

export default router;