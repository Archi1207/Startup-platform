const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Deal',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'redeemed'],
    default: 'pending'
  },
  claimedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  redemptionCode: String,
  expiresAt: Date,
  notes: String
}, {
  timestamps: true
});

// Ensure one claim per user per deal
claimSchema.index({ user: 1, deal: 1 }, { unique: true });

// Populate user and deal on find
claimSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'deal',
    select: 'title description partnerName category discount'
  }).populate({
    path: 'user',
    select: 'name email startupName'
  });
  next();
});

module.exports = mongoose.model('Claim', claimSchema);