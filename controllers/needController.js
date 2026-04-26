const Need = require('../models/Need');
const { AppError } = require('../middleware/errorHandler');

const getNeeds = async (req, res, next) => {
  try {
    const {
      category,
      urgency,
      status,
      region,
      source,
      sort = '-reportedDate',
      page = 1,
      limit = 20,
      search
    } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;
    if (status) filter.status = status;
    if (region) filter.region = region;
    if (source) filter.source = source;
    if (search) {
      filter.$text = { $search: search };
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const needs = await Need.find(filter)
      .populate('assignedVolunteers', 'name avatar skills')
      .populate('reportedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Need.countDocuments(filter);

    res.json({
      success: true,
      count: needs.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: needs
    });
  } catch (error) {
    next(error);
  }
};
 
const getNeed = async (req, res, next) => {
  try {
    const need = await Need.findById(req.params.id)
      .populate('assignedVolunteers', 'name avatar skills rating')
      .populate('reportedBy', 'name email');

    if (!need) {
      return next(new AppError('Need not found', 404));
    }

    res.json({
      success: true,
      data: need
    });
  } catch (error) {
    next(error);
  }
};

const createNeed = async (req, res, next) => {
  try {
    req.body.reportedBy = req.user.id;
    
    const need = await Need.create(req.body);

    res.status(201).json({
      success: true,
      data: need
    });
  } catch (error) {
    next(error);
  }
};


const updateNeed = async (req, res, next) => {
  try {
    const need = await Need.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedVolunteers', 'name avatar skills');

    if (!need) {
      return next(new AppError('Need not found', 404));
    }

    res.json({
      success: true,
      data: need
    });
  } catch (error) {
    next(error);
  }
};

const deleteNeed = async (req, res, next) => {
  try {
    const need = await Need.findByIdAndDelete(req.params.id);

    if (!need) {
      return next(new AppError('Need not found', 404));
    }

    res.json({
      success: true,
      message: 'Need deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const verifyNeed = async (req, res, next) => {
  try {
    const need = await Need.findByIdAndUpdate(
      req.params.id,
      { verified: true, verifiedBy: req.user.id },
      { new: true }
    );

    if (!need) {
      return next(new AppError('Need not found', 404));
    }

    res.json({
      success: true,
      data: need
    });
  } catch (error) {
    next(error);
  }
};

const getNeedStats = async (req, res, next) => {
  try {
    const stats = await Need.aggregate([
      {
        $group: {
          _id: null,
          totalNeeds: { $sum: 1 },
          totalAffected: { $sum: '$affectedPeople' },
          totalVolunteersNeeded: { $sum: '$volunteersNeeded' },
          totalVolunteersAssigned: { $sum: '$volunteersAssigned' },
          criticalCount: {
            $sum: { $cond: [{ $eq: ['$urgency', 'critical'] }, 1, 0] }
          },
          openCount: {
            $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
          }
        }
      }
    ]);

    const categoryStats = await Need.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAffected: { $sum: '$affectedPeople' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const regionStats = await Need.aggregate([
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 },
          criticalCount: {
            $sum: { $cond: [{ $eq: ['$urgency', 'critical'] }, 1, 0] }
          }
        }
      },
      { $sort: { criticalCount: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        byCategory: categoryStats,
        byRegion: regionStats
      }
    });
  } catch (error) {
    next(error);
  }
};

const getCriticalNeeds = async (req, res) => {
  try {
    const criticalNeeds = await Need.find({ urgency: "critical" })
    .select("title location category description affectedPeople volunteersNeeded volunteersAssigned")
      .sort({ createdAt: -1 }); // latest first

    res.status(200).json({
      success: true,
      count: criticalNeeds.length,
      data: criticalNeeds,
    });
  } catch (error) {
    console.error("Error fetching critical needs:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
module.exports = { getNeeds, getNeed, createNeed, updateNeed, deleteNeed, verifyNeed, getNeedStats ,getCriticalNeeds };
// #f3f0fa