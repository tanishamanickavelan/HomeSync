const mongoose = require('mongoose');

/**
 * Service Model
 * Managed by the Service Booking Agent
 */
const ServiceSchema = new mongoose.Schema({
  service_type: {
    type: String,
    enum: ['plumber', 'electrician', 'maid', 'laundry', 'cleaning', 'carpenter', 'pest_control', 'appliance_repair', 'other'],
    required: [true, 'Service type is required']
  },
  provider_name: {
    type: String,
    trim: true,
    maxlength: [100, 'Provider name cannot exceed 100 characters']
  },
  date: {
    type: Date,
    required: [true, 'Service date is required']
  },
  time: {
    type: String,
    required: [true, 'Service time is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  estimated_cost: {
    type: Number,
    min: 0
  },
  actual_cost: {
    type: Number,
    min: 0,
    default: null
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  booked_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

ServiceSchema.index({ family_id: 1, status: 1 });
ServiceSchema.index({ date: 1 });

module.exports = mongoose.model('Service', ServiceSchema);
