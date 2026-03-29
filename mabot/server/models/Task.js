const mongoose = require('mongoose');

/**
 * Task Model
 * Managed by the Task Agent
 */
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  due_date: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed'],
    default: 'pending'
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Family',
    required: true
  },
  tags: [{ type: String, trim: true }],
  completed_at: { type: Date, default: null },
  reminder_sent: { type: Boolean, default: false }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Index for fast family queries
TaskSchema.index({ family_id: 1, status: 1 });
TaskSchema.index({ due_date: 1 });

module.exports = mongoose.model('Task', TaskSchema);
