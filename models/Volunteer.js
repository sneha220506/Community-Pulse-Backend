const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/, 'Please provide a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  avatar: {
    type: String,
    default: '🧑'
  },
  skills: [{
    type: String,
    trim: true
  }],
  availability: {
    type: String,
    enum: ['full-time', 'part-time', 'weekends', 'flexible'],
    default: 'flexible'
  },
  location: {
    type: String,
    trim: true
  },
  region: {
    type: String,
    enum: ['North Zone', 'South Zone', 'East Zone', 'West Zone', 'Central Zone', 'All Zones'],
    default: 'Central Zone'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'on-task'],
    default: 'active'
  },
  currentTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  preferredCategories: [{
    type: String,
    enum: ['healthcare', 'education', 'food', 'shelter', 'environment', 'elderly', 'youth', 'disaster']
  }],
  tasksCompleted: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0,
    min: 0
  },
  hoursLogged: {
    type: Number,
    default: 0,
    min: 0
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    trim: true
  },
  emergencyContact: {
    name: { type: String, trim: true },
    phone: { type: String, trim: true }
  },
  // For tracking volunteer availability schedule
  schedule: {
    monday: { type: Boolean, default: false },
    tuesday: { type: Boolean, default: false },
    wednesday: { type: Boolean, default: false },
    thursday: { type: Boolean, default: false },
    friday: { type: Boolean, default: false },
    saturday: { type: Boolean, default: true },
    sunday: { type: Boolean, default: true }
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full availability info
volunteerSchema.virtual('isAvailable').get(function() {
  return this.status === 'active';
});

// Indexes
volunteerSchema.index({ skills: 1 });
volunteerSchema.index({ region: 1, status: 1 });
volunteerSchema.index({ preferredCategories: 1 });
volunteerSchema.index({ location: 'text', name: 'text' });

module.exports = mongoose.model('Volunteer', volunteerSchema);
