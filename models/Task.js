const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: ['healthcare', 'education', 'food', 'shelter', 'environment', 'elderly', 'youth', 'disaster']
  },
  urgency: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    default: 'medium'
  },
  needId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Need',
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'completed'],
    default: 'pending'
  },
  assignedVolunteers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer'
  }],
  volunteersRequired: {
    type: Number,
    required: true,
    min: [1, 'At least 1 volunteer is required']
  },
  estimatedHours: {
    type: Number,
    min: 0,
    default: 0
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  completedDate: {
    type: Date,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [{
    text: { type: String, required: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  checklist: [{
    item: { type: String, required: true },
    completed: { type: Boolean, default: false },
    completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Volunteer' }
  }],
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for progress percentage
taskSchema.virtual('progressPercent').get(function() {
  if (this.status === 'completed') return 100;
  if (this.status === 'in-progress') return 60;
  if (this.status === 'assigned') return 30;
  return 10;
});

// Virtual to check if fully staffed
taskSchema.virtual('isFullyStaffed').get(function() {
  return this.assignedVolunteers.length >= this.volunteersRequired;
});

// Indexes
taskSchema.index({ status: 1 });
taskSchema.index({ category: 1, urgency: 1 });
taskSchema.index({ needId: 1 });
taskSchema.index({ deadline: 1 });
taskSchema.index({ assignedVolunteers: 1 });

module.exports = mongoose.model('Task', taskSchema);
