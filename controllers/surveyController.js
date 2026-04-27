const Survey = require('../models/Survey');
const { AppError } = require('../middleware/errorHandler');

const getSurveys = async (req, res, next) => {
  try {
    const {
      category,
      urgency,
      verified,
      sort = '-date',
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;
    if (verified !== undefined) filter.verified = verified === 'true';

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
      data: surveys
    });
  } catch (error) {
    next(error);
  }
};

const getSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findById(req.params.id);

    if (!survey) {
      return next(new AppError('Survey entry not found', 404));
    }

    res.json({
      success: true,
      data: survey
    });
  } catch (error) {
    next(error);
  }
};

const submitSurvey = async (req, res, next) => {
  try {
    if (req.user) {
      req.body.submitterId = req.user.id;
    }

    let photos = [];

    // IMP
    if (req.files && req.files.length > 0) {
      photos = req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        caption: file.originalname
      }));
    }

    const survey = await Survey.create({
      ...req.body,
      photos
    });
    res.status(201).json({
      success: true,
      message: 'Field report submitted successfully.',
      data: survey
    });

  } catch (error) {
    next(error);
  }
};

const verifySurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findByIdAndUpdate(
      req.params.id,
      {
        verified: true,
        verifiedBy: req.user.id,
        verifiedAt: new Date()
      },
      { new: true }
    );

    if (!survey) {
      return next(new AppError('Survey entry not found', 404));
    }

    res.json({
      success: true,
      data: survey
    });
  } catch (error) {
    next(error);
  }
};

const deleteSurvey = async (req, res, next) => {
  try {
    const survey = await Survey.findByIdAndDelete(req.params.id);

    if (!survey) {
      return next(new AppError('Survey entry not found', 404));
    }

    res.json({
      success: true,
      message: 'Survey entry deleted'
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
            $sum: { $cond: ['$verified', 1, 0] }
          },
          totalAffected: { $sum: '$affectedCount' },
          criticalReports: {
            $sum: { $cond: [{ $eq: ['$urgency', 'critical'] }, 1, 0] }
          }
        }
      }
    ]);

    const byCategory = await Survey.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          affected: { $sum: '$affectedCount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const bySource = await Survey.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentReports = await Survey.find()
      .sort({ date: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        byCategory,
        bySource,
        recentReports
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSurveys, getSurvey, submitSurvey, verifySurvey, deleteSurvey, getSurveyStats
};
