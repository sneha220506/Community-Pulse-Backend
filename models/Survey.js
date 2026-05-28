const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema(
  {
    submittedBy: {
      type: String,
      required: [true, "Submitter name is required"],
      trim: true,
    },

    submitterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    // Auto detected state/region
    region: {
      type: String,
      trim: true,
      default: "",
    },

    // Full address from Google Maps
    fullAddress: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "healthcare",
        "education",
        "food",
        "shelter",
        "environment",
        "elderly",
        "youth",
        "disaster",
      ],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    affectedCount: {
      type: Number,
      required: [true, "Number of affected people is required"],
      min: [0, "Count cannot be negative"],
    },

    urgency: {
      type: String,
      required: [true, "Urgency level is required"],
      enum: ["critical", "high", "medium", "low"],
    },

    date: {
      type: Date,
      default: Date.now,
    },

    verified: {
      type: Boolean,
      default: false,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    source: {
      type: String,
      enum: ["survey", "field-report", "community", "ngo"],
      default: "field-report",
    },

    surveyType: {
      type: String,
      enum: [
        "door-to-door",
        "community-meeting",
        "phone-survey",
        "online",
        "observation",
        "other",
        "interview",
      ],
      default: "observation",
    },

    contactPerson: {
      name: {
        type: String,
        trim: true,
      },

      phone: {
        type: String,
        trim: true,
      },

      role: {
        type: String,
        trim: true,
      },
    },

    // GOOGLE MAPS GPS COORDINATES
    gpsCoordinates: {
      latitude: {
        type: Number,
        required: false,
      },

      longitude: {
        type: Number,
        required: false,
      },
    },

    // GeoJSON for MongoDB geospatial queries
    mapLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },

      coordinates: {
        type: [Number], // [longitude, latitude] - Note: GeoJSON uses lng, lat order
        default: undefined,
      },
    },

    photos: [
      {
        url: {
          type: String,
        },

        caption: {
          type: String,
        },

        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    linkedNeedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Need",
      default: null,
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

// INDEXES
surveySchema.index({
  category: 1,
  urgency: 1,
});

surveySchema.index({
  location: "text",
  description: "text",
});

surveySchema.index({
  verified: 1,
});

surveySchema.index({
  date: -1,
});

// GEO INDEX FOR MAP SEARCHES
surveySchema.index({
  mapLocation: "2dsphere",
});

// Pre-save middleware to sync gpsCoordinates with mapLocation
surveySchema.pre("save", function (next) {
  if (
    this.gpsCoordinates &&
    this.gpsCoordinates.latitude &&
    this.gpsCoordinates.longitude
  ) {
    this.mapLocation = {
      type: "Point",
      coordinates: [
        this.gpsCoordinates.longitude,
        this.gpsCoordinates.latitude,
      ],
    };
  }
  next();
});

module.exports = mongoose.model("Survey", surveySchema);
