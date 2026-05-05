const Survey = require("../models/Survey");
const User = require("../models/User");
const { AppError } = require("../middleware/errorHandler");
const { getIO } = require("../config/socket");
const Notification = require("../models/Notification");

const getSurveys = async (req, res, next) => {
  try {
    const {
      category,
      urgency,
      verified,
      sort = "-date",
      page = 1,
      limit = 20,
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;
    if (verified !== undefined) filter.verified = verified === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const surveys = await Survey.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Survey.countDocuments(filter);

    res.json({
      success: true,
      count: surveys.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: surveys,
    });
  } catch (error) {
    next(error);
  }
};

const getSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return next(new AppError("Survey entry not found", 404));
    }

    res.json({
      success: true,
      data: survey,
    });
  } catch (error) {
    next(error);
  }
};

const submitSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.create({
      ...req.body,
      submitterId: req.user.id,
    });

    const staffMembers = await User.find({
      role: { $in: ["admin", "coordinator"] },
    });

    if (staffMembers.length > 0) {
      const notifications = staffMembers.map((staff) => ({
        recipient: staff._id,
        sender: req.user.id,
        type: "NEW_SURVEY",
        title: "New Survey Submitted",
        message: `${req.user.name} has submitted a new report.`,
        relatedId: survey._id,
        onModel: "Survey",
      }));

      const savedNotifs = await Notification.insertMany(notifications);

      const io = getIO();
      if (!io) {
        console.error(
          "❌ Socket.io instance not found! Check your socket config.",
        );
      } else {
        // ✅ Emit each notification with its unique ID
        savedNotifs.forEach((notif) => {
          const socketPayload = {
            _id: notif._id,  // ✅ Unique ID per notification
            title: notif.title,
            message: notif.message,
            type: notif.type,
            createdAt: notif.createdAt,
            isRead: false,
            recipient: notif.recipient,
          };

          // ✅ Send to specific recipient
          io.to(notif.recipient.toString()).emit("NOTIFICATION_RECEIVED", socketPayload);
        });
      }
    }

    res.status(201).json({ success: true, data: survey });
  } catch (error) {
    console.error("Survey Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};
const verifySurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findByIdAndUpdate(
      req.params.id,
      {
        verified: true,
        verifiedBy: req.user.id,
        verifiedAt: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!survey) {
      return next(new AppError("Survey entry not found", 404));
    }

    const notification = await Notification.create({
      recipient: survey.submitterId,
      sender: req.user.id,
      type: "SURVEY_APPROVED",
      title: "Survey Verified",
      message: `Your survey "${survey.title || "Report"}" has been approved and verified!`,
      relatedId: survey._id,
      onModel: "Survey",
    });

    const io = getIO();

    // ✅ Use _id instead of id for consistency
    io.to(survey.submitterId.toString()).emit("NOTIFICATION_RECEIVED", {
      _id: notification._id,  // ✅ Changed from 'id'
      type: notification.type,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
      isRead: notification.isRead,
      surveyId: survey._id,
    });

    res.json({
      success: true,
      message: "Survey verified successfully",
      data: survey,
    });
  } catch (error) {
    next(error);
  }
};
const deleteSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findByIdAndDelete(req.params.id);

    if (!survey) {
      return next(new AppError("Survey entry not found", 404));
    }

    res.json({
      success: true,
      message: "Survey entry deleted",
    });
  } catch (error) {
    next(error);
  }
};

const getSurveyStats = async (req, res, next) => {
  try {
    const stats = await Survey.aggregate([
      {
        $group: {
          _id: null,
          totalReports: { $sum: 1 },
          verifiedReports: {
            $sum: { $cond: ["$verified", 1, 0] },
          },
          totalAffected: { $sum: "$affectedCount" },
          criticalReports: {
            $sum: { $cond: [{ $eq: ["$urgency", "critical"] }, 1, 0] },
          },
        },
      },
    ]);

    const byCategory = await Survey.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          affected: { $sum: "$affectedCount" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const bySource = await Survey.aggregate([
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
    ]);

    const recentReports = await Survey.find().sort({ date: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        byCategory,
        bySource,
        recentReports,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSurveys,
  getSurvey,
  submitSurvey,
  verifySurvey,
  deleteSurvey,
  getSurveyStats,
};
