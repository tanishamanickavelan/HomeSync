const mongoose = require('mongoose');

/**
 * Family Model
 * A household group that users belong to
 */
const FamilySchema = new mongoose.Schema({
  family_name: {
    type: String,
    required: [true, 'Family name is required'],
    trim: true,
    maxlength: [100, 'Family name cannot exceed 100 characters']
  },
  invite_code: {
    type: String,
    unique: true,
    uppercase: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  city: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Auto-generate invite code
FamilySchema.pre('save', function(next) {
  if (!this.invite_code) {
    this.invite_code = Math.random().toString(36).substring(2, 8).toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Family', FamilySchema);
