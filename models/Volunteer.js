const mongoose = require('mongoose');

const volunteerSchema = new mongoose.Schema({

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  age: {
    type: Number
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
    enum: [
      'healthcare',
      'education',
      'food',
      'shelter',
      'environment',
      'elderly',
      'youth',
      'disaster'
    ]
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
    maxlength: 500,
    trim: true
  },

  emergencyContact: {
    name: {
      type: String,
      trim: true
    },

    phone: {
      type: String,
      trim: true
    }
  },

  schedule: {

    monday: {
      type: Boolean,
      default: false
    },

    tuesday: {
      type: Boolean,
      default: false
    },

    wednesday: {
      type: Boolean,
      default: false
    },

    thursday: {
      type: Boolean,
      default: false
    },

    friday: {
      type: Boolean,
      default: false
    },

    saturday: {
      type: Boolean,
      default: true
    },

    sunday: {
      type: Boolean,
      default: true
    }
  },

  joinedDate: {
    type: Date,
    default: Date.now
  }

}, {

  timestamps: true,

  toJSON: {
    virtuals: true
  },

  toObject: {
    virtuals: true
  }
});


// Virtual
volunteerSchema.virtual('isAvailable')
.get(function () {

  return this.status === 'active';

});


// Correct indexes
volunteerSchema.index({ skills: 1 });

volunteerSchema.index({
  preferredCategories: 1
});

volunteerSchema.index({
  status: 1
});

module.exports =
  mongoose.model(
    'Volunteer',
    volunteerSchema
  );