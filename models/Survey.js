const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  submittedBy: {
    type: String,
    required: [true, 'Submitter name is required'],
    trim: true
  },
  submitterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  region: {
    type: String,
    enum: ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone', 'All Zones'],
    default: 'Central Zone'
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['healthcare', 'education', 'food', 'shelter', 'environment', 'elderly', 'youth', 'disaster']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  affectedCount: {
    type: Number,
    required: [true, 'Number of affected people is required'],
    min: [0, 'Count cannot be negative']
  },
  urgency: {
    type: String,
    required: [true, 'Urgency level is required'],
    enum: ['critical', 'high', 'medium', 'low']
  },
  date: {
    type: Date,
    default: Date.now
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: {
    type: Date,
    default: null
  },
  source: {
    type: String,
    enum: ['survey', 'field-report', 'community', 'ngo'],
    default: 'field-report'
  },
  // Additional survey-specific fields
  surveyType: {
    type: String,
    enum: ['door-to-door', 'community-meeting', 'phone-survey', 'online', 'observation', 'other'],
    default: 'observation'
  },
  contactPerson: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    role: { type: String, trim: true }
  },
  gpsCoordinates: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  photos: [{
    url: { type: String },
    caption: { type: String },
    uploadedAt: { type: Date, default: Date.now }
  }],
  // Linked need (if this survey led to a need entry)
  linkedNeedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Need',
    default: null
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes
surveySchema.index({ category: 1, urgency: 1 });
surveySchema.index({ location: 'text', description: 'text' });
surveySchema.index({ verified: 1 });
surveySchema.index({ date: -1 });

module.exports = mongoose.model('Survey', surveySchema);
