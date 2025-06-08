import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const prebookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleType: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['bike', 'car', 'auto', 'van', 'bus', 'lorry']
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    trim: true,
    uppercase: true
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true,
    maxlength: [50, 'Customer name cannot exceed 50 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit phone number']
  },
  scheduledTime: {
    type: Date,
    required: [true, 'Scheduled time is required'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Scheduled time must be in the future'
    }
  },
  tokenNumber: {
    type: String,
    unique: true,
    required: true,
    default: function() {
      const timestamp = Date.now().toString().slice(-4);
      const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      return `ASR${timestamp}${random}`;
    }
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verificationTime: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  whatsappSent: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Remove the auto-expire hook as it's causing issues with the admin view
// prebookingSchema.pre(/^find/, function(next) {
//   const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
//   this.find({
//     scheduledTime: { $gte: oneDayAgo },
//     status: { $ne: 'expired' }
//   });
//   next();
// });

export default mongoose.model('Prebooking', prebookingSchema);