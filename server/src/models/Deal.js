const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Deal title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  longDescription: String,
  partnerName: {
    type: String,
    required: [true, 'Partner name is required']
  },
  partnerLogo: String,
  category: {
    type: String,
    enum: ['cloud', 'marketing', 'analytics', 'productivity', 'development', 'design'],
    required: true
  },
  accessLevel: {
    type: String,
    enum: ['public', 'verified', 'premium'],
    default: 'public'
  },
  discount: {
    type: String,
    required: true
  },
  originalPrice: String,
  discountPrice: String,
  validity: Date,
  eligibilityConditions: [String],
  requirements: [String],
  claimCount: {
    type: Number,
    default: 0
  },
  maxClaims: Number,
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for fast queries
dealSchema.index({ category: 1, accessLevel: 1, isActive: 1 });
dealSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Deal', dealSchema);