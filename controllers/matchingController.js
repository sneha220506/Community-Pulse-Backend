const Need = require('../models/Need');
const Volunteer = require('../models/Volunteer');
const Task = require('../models/Task');
const { calculateMatchScore } = require('../utils/matchingAlgorithm');
const {
  findMatchesForNeed,
  findAllMatches,
  getMatchingStats
} = require('../utils/matchingAlgorithm');
const { AppError } = require('../middleware/errorHandler');

const matchForNeed = async (req, res, next) => {
  try {
    const { needId } = req.params;
    const { minScore = 30, maxResults = 10 } = req.query;

    const need = await Need.findById(needId);
    if (!need) {
      return next(new AppError('Need not found', 404));
    }

    // Get all active volunteers
    const volunteers = await Volunteer.find({ status: 'active' });

    const matches = findMatchesForNeed(need, volunteers, {
      minScore: parseInt(minScore),
      maxResults: parseInt(maxResults)
    });

    const stats = getMatchingStats(matches);

    res.json({
      success: true,
      need: {
        id: need._id,
        title: need.title,
        category: need.category,
        urgency: need.urgency,
        location: need.location
      },
      matches: matches.map(m => ({
        volunteer: {
          id: m.volunteer._id,
          name: m.volunteer.name,
          avatar: m.volunteer.avatar,
          skills: m.volunteer.skills,
          availability: m.volunteer.availability,
          location: m.volunteer.location,
          rating: m.volunteer.rating,
          tasksCompleted: m.volunteer.tasksCompleted
        },
        score: m.score,
        reasons: m.reasons,
        breakdown: m.breakdown
      })),
      stats
    });
  } catch (error) {
    next(error);
  }
};

const matchAll = async (req, res, next) => {
  try {
    const { minScore = 30, maxPerNeed = 5 } = req.query;

    // Get all understaffed needs and active volunteers
    const needs = await Need.find({
      status: { $ne: 'resolved' },
      $expr: { $lt: ['$volunteersAssigned', '$volunteersNeeded'] }
    });

    const volunteers = await Volunteer.find({ status: 'active' });

    const matches = findAllMatches(needs, volunteers, {
      minScore: parseInt(minScore),
      maxPerNeed: parseInt(maxPerNeed)
    });

    const stats = getMatchingStats(matches);

    // Group matches by need
    const groupedMatches = {};
    matches.forEach(match => {
      const needId = match.need._id.toString();
      if (!groupedMatches[needId]) {
        groupedMatches[needId] = {
          need: {
            id: match.need._id,
            title: match.need.title,
            category: match.need.category,
            urgency: match.need.urgency,
            location: match.need.location
          },
          volunteers: []
        };
      }
      groupedMatches[needId].volunteers.push({
        volunteer: {
          id: match.volunteer._id,
          name: match.volunteer.name,
          avatar: match.volunteer.avatar,
          skills: match.volunteer.skills,
          availability: match.volunteer.availability,
          rating: match.volunteer.rating
        },
        score: match.score,
        reasons: match.reasons
      });
    });

    res.json({
      success: true,
      totalMatches: matches.length,
      needsAnalyzed: needs.length,
      volunteersAvailable: volunteers.length,
      groupedMatches,
      stats
    });
  } catch (error) {
    next(error);
  }
};

const matchForVolunteer = async (req, res, next) => {
  try {
    const { volunteerId } = req.params;
    const { minScore = 30, maxResults = 5 } = req.query;

    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return next(new AppError('Volunteer not found', 404));
    }

    // Get all open needs
    const needs = await Need.find({
      status: { $ne: 'resolved' },
      $expr: { $lt: ['$volunteersAssigned', '$volunteersNeeded'] }
    });

    const matches = [];
    for (const need of needs) {
      const result = calculateMatchScore(volunteer, need);
      
      if (result.score >= parseInt(minScore)) {
        matches.push({
          need: {
            id: need._id,
            title: need.title,
            category: need.category,
            urgency: need.urgency,
            location: need.location,
            affectedPeople: need.affectedPeople,
            volunteersNeeded: need.volunteersNeeded,
            volunteersAssigned: need.volunteersAssigned
          },
          score: result.score,
          reasons: result.reasons,
          breakdown: result.breakdown
        });
      }
    }

    matches.sort((a, b) => b.score - a.score);
    const limitedMatches = matches.slice(0, parseInt(maxResults));

    res.json({
      success: true,
      volunteer: {
        id: volunteer._id,
        name: volunteer.name,
        avatar: volunteer.avatar,
        skills: volunteer.skills,
        preferredCategories: volunteer.preferredCategories
      },
      matches: limitedMatches
    });
  } catch (error) {
    next(error);
  }
};

const confirmMatch = async (req, res, next) => {
  try {
    const { volunteerId, needId, taskId } = req.body;

    if (!volunteerId || !needId) {
      return next(new AppError('volunteerId and needId are required', 400));
    }

    // Verify volunteer
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return next(new AppError('Volunteer not found', 404));
    }
    if (volunteer.status === 'on-task') {
      return next(new AppError('Volunteer is already assigned to a task', 400));
    }

    // Verify need
    const need = await Need.findById(needId);
    if (!need) {
      return next(new AppError('Need not found', 404));
    }

    // Find or create task
    let task;
    if (taskId) {
      task = await Task.findById(taskId);
      if (!task) {
        return next(new AppError('Task not found', 404));
      }
    } else {
      // Find an existing task for this need
      task = await Task.findOne({ needId, status: { $in: ['pending', 'assigned'] } });
      
      if (!task) {
        return next(new AppError('No open task found for this need. Please create a task first.', 404));
      }
    }

    // Check if already assigned
    if (task.assignedVolunteers.includes(volunteerId)) {
      return next(new AppError('Volunteer already assigned to this task', 400));
    }

    // Assign
    task.assignedVolunteers.push(volunteerId);
    if (task.status === 'pending') task.status = 'assigned';
    if (task.assignedVolunteers.length >= task.volunteersRequired) task.status = 'in-progress';
    await task.save();

    // Update volunteer
    volunteer.status = 'on-task';
    volunteer.currentTask = task._id;
    await volunteer.save();

    // Update need
    need.volunteersAssigned = (need.volunteersAssigned || 0) + 1;
    if (!need.assignedVolunteers.includes(volunteerId)) {
      need.assignedVolunteers.push(volunteerId);
    }
    if (need.volunteersAssigned >= need.volunteersNeeded && need.status === 'open') {
      need.status = 'in-progress';
    }
    await need.save();

    res.json({
      success: true,
      message: 'Match confirmed! Volunteer has been assigned.',
      data: {
        task: {
          id: task._id,
          title: task.title,
          status: task.status
        },
        volunteer: {
          id: volunteer._id,
          name: volunteer.name,
          status: volunteer.status
        },
        need: {
          id: need._id,
          title: need.title,
          volunteersAssigned: need.volunteersAssigned,
          volunteersNeeded: need.volunteersNeeded
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { matchForNeed, matchAll, matchForVolunteer, confirmMatch };
