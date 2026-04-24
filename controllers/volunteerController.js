const Volunteer = require('../models/Volunteer');
const { AppError } = require('../middleware/errorHandler');

const getVolunteers = async (req, res, next) => {
  try {
    const {
      status,
      availability,
      region,
      skill,
      category,
      sort = '-tasksCompleted',
      page = 1,
      limit = 20,
      search
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (availability) filter.availability = availability;
    if (region) filter.region = region;
    if (skill) filter.skills = { $in: [new RegExp(skill, 'i')] };
    if (category) filter.preferredCategories = { $in: [category] };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { skills: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const volunteers = await Volunteer.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Volunteer.countDocuments(filter);

    res.json({
      success: true,
      count: volunteers.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: volunteers
    });
  } catch (error) {
    next(error);
  }
};

const getVolunteer = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id)
      .select('-password')
      .populate('currentTask');

    if (!volunteer) {
      return next(new AppError('Volunteer not found', 404));
    }

    res.json({
      success: true,
      data: volunteer
    });
  } catch (error) {
    next(error);
  }
};

const registerVolunteer = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.create(req.body);
    
    const token = volunteer.generateAuthToken
      ? volunteer.generateAuthToken()
      : null;

    res.status(201).json({
      success: true,
      data: volunteer,
      ...(token && { token })
    });
  } catch (error) {
    next(error);
  }
};

const updateVolunteer = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!volunteer) {
      return next(new AppError('Volunteer not found', 404));
    }

    res.json({
      success: true,
      data: volunteer
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const volunteer = await Volunteer.findByIdAndUpdate(
      req.params.id,
      { status, lastActive: new Date() },
      { new: true }
    ).select('-password');

    if (!volunteer) {
      return next(new AppError('Volunteer not found', 404));
    }

    res.json({
      success: true,
      data: volunteer
    });
  } catch (error) {
    next(error);
  }
};

const rateVolunteer = async (req, res, next) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return next(new AppError('Rating must be between 1 and 5', 400));
    }

    const volunteer = await Volunteer.findById(req.params.id);
    if (!volunteer) {
      return next(new AppError('Volunteer not found', 404));
    }

    // Calculate new average rating
    const totalRatingPoints = (volunteer.rating * volunteer.totalRatings) + rating;
    volunteer.totalRatings += 1;
    volunteer.rating = Math.round((totalRatingPoints / volunteer.totalRatings) * 10) / 10;
    await volunteer.save();

    res.json({
      success: true,
      data: {
        rating: volunteer.rating,
        totalRatings: volunteer.totalRatings
      }
    });
  } catch (error) {
    next(error);
  }
};

const getVolunteerStats = async (req, res, next) => {
  try {
    const stats = await Volunteer.aggregate([
      {
        $group: {
          _id: null,
          totalVolunteers: { $sum: 1 },
          activeVolunteers: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalTasksCompleted: { $sum: '$tasksCompleted' },
          totalHoursLogged: { $sum: '$hoursLogged' },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    const availabilityStats = await Volunteer.aggregate([
      {
        $group: {
          _id: '$availability',
          count: { $sum: 1 }
        }
      }
    ]);

    const regionStats = await Volunteer.aggregate([
      {
        $group: {
          _id: '$region',
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      }
    ]);

    const topSkills = await Volunteer.aggregate([
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {},
        byAvailability: availabilityStats,
        byRegion: regionStats,
        topSkills
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteVolunteer = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findByIdAndDelete(req.params.id);

    if (!volunteer) {
      return next(new AppError('Volunteer not found', 404));
    }

    res.json({
      success: true,
      message: 'Volunteer removed successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVolunteers, getVolunteer, registerVolunteer, updateVolunteer,
  updateStatus, rateVolunteer, getVolunteerStats, deleteVolunteer
};
