const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true // Optimized for querying a specific user's alerts
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    type: {
        type: String,
        enum: ['NEW_SURVEY', 'SURVEY_APPROVED', 'SURVEY_REJECTED', 'TASK_ASSIGNED'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        // This links to the Survey or Task ID so the user can click it
    },
    onModel: {
        type: String,
        required: true,
        enum: ['Survey', 'Task', 'Need']
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 2592000 // Automatically delete notifications after 30 days (optional)
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);