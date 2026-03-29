const mongoose = require('mongoose');

/**
 * Grocery Model
 * Managed by the Grocery Agent
 */
const GrocerySchema = new mongoose.Schema({
  item_name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 1
  },
  unit: {
    type: String,
    trim: true,
    default: 'pcs' // e.g., kg, L, pcs, dozen
  },
  category: {
    type: String,
    enum: ['dairy', 'vegetables', 'fruits', 'grains', 'snacks', 'beverages', 'meat', 'household_items', 'personal_care', 'other'],
    default: 'other'
  },
  purchased: {
    type: Boolean,
    default: false
  },
  purchased_at: {
    type: Date,
    default: null
  },
  low_stock_threshold: {
    type: Number,
    default: 1
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  },
  added_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },
  reminder_sent: { type: Boolean, default: false }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

GrocerySchema.index({ family_id: 1, purchased: 1 });

module.exports = mongoose.model('Grocery', GrocerySchema);
