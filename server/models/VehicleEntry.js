import mongoose from 'mongoose';

const vehicleEntrySchema = new mongoose.Schema({
  vehicleType: {
    type: String,
    required: [true, 'Vehicle type is required'],
    enum: ['bike', 'car', 'auto', 'van', 'bus', 'lorry']
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        // Remove all spaces from the input
        const cleanNumber = v.replace(/\s+/g, '');
        // Check if it matches either format
        return /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/.test(cleanNumber);
      },
      message: 'Please enter a valid vehicle number (e.g., "TN75AA8989" or "YN 75 AA 8989")'
    },
    set: function(v) {
      // Remove all spaces and convert to uppercase
      return v.replace(/\s+/g, '').toUpperCase();
    }
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
  entryTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  exitTime: {
    type: Date
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPrebooked: {
    type: Boolean,
    default: false
  },
  tokenNumber: {
    type: String,
    sparse: true // Allow null values but maintain uniqueness when present
  },
  billAmount: {
    type: Number,
    min: [0, 'Bill amount cannot be negative']
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paymentTime: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Calculate bill amount based on vehicle type and duration
vehicleEntrySchema.methods.calculateBill = function() {
  if (!this.exitTime) return 0;
  
  const entryDate = new Date(this.entryTime);
  const exitDate = new Date(this.exitTime);
  
  // Calculate days difference (minimum 1 day)
  const timeDiff = exitDate.getTime() - entryDate.getTime();
  const daysDiff = Math.max(1, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  
  // Billing rates
  const rates = {
    bike: { day1: 10, additional: 15 },
    car: { day1: 30, additional: 45 },
    auto: { day1: 30, additional: 45 },
    van: { day1: 50, additional: 75 },
    bus: { day1: 50, additional: 75 },
    lorry: { day1: 50, additional: 75 }
  };
  
  const rate = rates[this.vehicleType];
  if (!rate) return 0;
  
  // Calculate total bill
  const additionalDays = Math.max(0, daysDiff - 1);
  const totalBill = rate.day1 + (additionalDays * rate.additional);
  
  return totalBill;
};

// Update bill amount before saving
vehicleEntrySchema.pre('save', function(next) {
  if (this.exitTime && !this.billAmount) {
    this.billAmount = this.calculateBill();
  }
  next();
});

export default mongoose.model('VehicleEntry', vehicleEntrySchema);