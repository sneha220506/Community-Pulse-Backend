const mongoose = require('mongoose');
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:5000';

const needSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['healthcare', 'education', 'food', 'shelter', 'environment', 'elderly', 'youth', 'disaster']
  },
  urgency: {
    type: String,
    required: [true, 'Urgency level is required'],
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  region: {
    type: String,
    required: [true, 'Region is required'],
    trim:true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  affectedPeople: {
    type: Number,
    required: [true, 'Number of affected people is required'],
    min: [0, 'Affected people count cannot be negative']
  },
  reportedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved'],
    default: 'open'
  },
  source: {
    type: String,
    enum: ['survey', 'field-report', 'community', 'ngo'],
    required: true
  },
  volunteersNeeded: {
    type: Number,
    required: true,
    min: [1, 'At least 1 volunteer is needed']
  },
  volunteersAssigned: {
    type: Number,
    default: 0,
    min: 0
  },
  assignedVolunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer'
  }],
  // Refactored from arbitrary screen percentages to actual global geography coordinates
  gpsCoordinates: {
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 }
  },
  images: [{
  type: String,
  // The 'get' function modifies the value on the fly when passing data to the frontend
  get: function(img) {
    if (!img) return img;
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return `${SERVER_URL}${img}`;
  }
}],
  tags: [{
    type: String,
    trim: true
  }],
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true ,getters : true},
  toObject: { virtuals: true ,getters : true}
});

// Virtual for volunteer coverage percentage
needSchema.virtual('coveragePercent').get(function() {
  if (this.volunteersNeeded === 0) return 100;
  return Math.min(Math.round((this.volunteersAssigned / this.volunteersNeeded) * 100), 100);
});

// Index for efficient queries
needSchema.index({ category: 1, urgency: 1 });
needSchema.index({ region: 1, status: 1 });
needSchema.index({ urgency: 1, status: 1 });
needSchema.index({ location: 'text', title: 'text', description: 'text' });

module.exports = mongoose.model('Need', needSchema);