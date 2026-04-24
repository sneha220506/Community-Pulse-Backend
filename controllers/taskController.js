const Task = require('../models/Task');
const Need = require('../models/Need');
const Volunteer = require('../models/Volunteer');
const { AppError } = require('../middleware/errorHandler');
 
const getTasks = async (req, res, next) => {
  try {
    const {
      status,
      category,
      urgency,
      sort = '-createdAt',
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (urgency) filter.urgency = urgency;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const tasks = await Task.find(filter)
      .populate('needId', 'title location urgency')
      .populate('assignedVolunteers', 'name avatar skills rating')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      count: tasks.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: tasks
    });
  } catch (error) {
    next(error);
  }
};
 
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('needId', 'title location urgency affectedPeople')
      .populate('assignedVolunteers', 'name avatar skills rating availability');

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { needId } = req.body;

    // Verify the need exists
    const need = await Need.findById(needId);
    if (!need) {
      return next(new AppError('Associated need not found', 404));
    }

    req.body.createdBy = req.user.id;
    const task = await Task.create(req.body);

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedVolunteers', 'name avatar skills');

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

const assignVolunteer = async (req, res, next) => {
  try {
    const { volunteerId } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    // Check volunteer exists and is available
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return next(new AppError('Volunteer not found', 404));
    }

    if (volunteer.status === 'on-task' && volunteer.currentTask) {
      return next(new AppError('Volunteer is already assigned to another task', 400));
    }

    // Check if already assigned
    if (task.assignedVolunteers.includes(volunteerId)) {
      return next(new AppError('Volunteer already assigned to this task', 400));
    }

    // Check capacity
    if (task.assignedVolunteers.length >= task.volunteersRequired) {
      return next(new AppError('Task already has the required number of volunteers', 400));
    }

    // Assign volunteer
    task.assignedVolunteers.push(volunteerId);
    
    // Update task status based on staffing
    if (task.status === 'pending') {
      task.status = 'assigned';
    }
    if (task.assignedVolunteers.length >= task.volunteersRequired) {
      task.status = 'in-progress';
    }

    await task.save();

    // Update volunteer status
    volunteer.status = 'on-task';
    volunteer.currentTask = task._id;
    await volunteer.save();

    // Update need's volunteer count
    const need = await Need.findById(task.needId);
    if (need) {
      const allTaskVolunteers = await Task.find({ needId: task.needId });
      const uniqueVolunteers = new Set();
      allTaskVolunteers.forEach(t => {
        t.assignedVolunteers.forEach(v => uniqueVolunteers.add(v.toString()));
      });
      need.volunteersAssigned = uniqueVolunteers.size;
      await need.save();
    }

    const updatedTask = await Task.findById(task._id)
      .populate('assignedVolunteers', 'name avatar skills rating');

    res.json({
      success: true,
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

const unassignVolunteer = async (req, res, next) => {
  try {
    const { volunteerId } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    task.assignedVolunteers = task.assignedVolunteers.filter(
      v => v.toString() !== volunteerId
    );

    if (task.assignedVolunteers.length === 0) {
      task.status = 'pending';
    } else if (task.assignedVolunteers.length < task.volunteersRequired) {
      task.status = 'assigned';
    }

    await task.save();

    // Update volunteer status
    const volunteer = await Volunteer.findById(volunteerId);
    if (volunteer) {
      volunteer.status = 'active';
      volunteer.currentTask = null;
      await volunteer.save();
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

const completeTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    task.status = 'completed';
    task.completedDate = new Date();
    await task.save();

    // Update volunteer stats
    for (const volId of task.assignedVolunteers) {
      const volunteer = await Volunteer.findById(volId);
      if (volunteer) {
        volunteer.tasksCompleted += 1;
        volunteer.hoursLogged += task.estimatedHours || 0;
        volunteer.status = 'active';
        volunteer.currentTask = null;
        await volunteer.save();
      }
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

const getTaskBoard = async (req, res, next) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: '$status',
          tasks: { $push: '$$ROOT' },
          count: { $sum: 1 }
        }
      }
    ];

    const board = await Task.aggregate(pipeline);
    
    const formattedBoard = {
      pending: board.find(b => b._id === 'pending')?.tasks || [],
      assigned: board.find(b => b._id === 'assigned')?.tasks || [],
      'in-progress': board.find(b => b._id === 'in-progress')?.tasks || [],
      completed: board.find(b => b._id === 'completed')?.tasks || [],
    };

    res.json({
      success: true,
      data: formattedBoard
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return next(new AppError('Task not found', 404));
    }

    // Release assigned volunteers
    for (const volId of task.assignedVolunteers) {
      const volunteer = await Volunteer.findById(volId);
      if (volunteer) {
        volunteer.status = 'active';
        volunteer.currentTask = null;
        await volunteer.save();
      }
    }

    res.json({
      success: true,
      message: 'Task deleted and volunteers released'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks, getTask, createTask, updateTask, assignVolunteer,
  unassignVolunteer, completeTask, getTaskBoard, deleteTask
};
