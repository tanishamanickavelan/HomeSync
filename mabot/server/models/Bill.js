const mongoose = require('mongoose');

/**
 * Bill Model
 * Managed by the Finance Agent
 */
const BillSchema = new mongoose.Schema({
  bill_name: {
    type: String,
    required: [true, 'Bill name is required'],
    trim: true,
    maxlength: [100, 'Bill name cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  due_date: {
    type: Date,
    required: [true, 'Due date is required']
  },
  status: {
    type: String,
    enum: ['unpaid', 'paid', 'overdue'],
    default: 'unpaid'
  },
  category: {
    type: String,
    enum: ['electricity', 'water', 'internet', 'phone', 'gas', 'rent', 'insurance', 'emi', 'subscription', 'other'],
    default: 'other'
  },
  paid_at: { type: Date, default: null },
  paid_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  recurring: { type: Boolean, default: false },
  recurring_cycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly', null],
    default: null
  },
  notes: { type: String, trim: true },
  reminder_sent: { type: Boolean, default: false },
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

BillSchema.index({ family_id: 1, status: 1 });
BillSchema.index({ due_date: 1 });

module.exports = mongoose.model('Bill', BillSchema);
