const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: String,
    message: String,
    type: String,
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ✅ IMPORTANT: export MODEL, not schema
module.exports = mongoose.model("Notification", notificationSchema);