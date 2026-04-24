const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getTasks, getTask, createTask, updateTask, assignVolunteer,
  unassignVolunteer, completeTask, getTaskBoard, deleteTask
} = require('../controllers/taskController');

const router = express.Router();

// Public routes
router.get('/board', getTaskBoard);
router.get('/', getTasks);
router.get('/:id', getTask);

// Protected routes
router.post(
  '/',
  protect,
  authorize('admin', 'coordinator'),
  createTask
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'coordinator'),
  updateTask
);

router.post(
  '/:id/assign',
  protect,
  authorize('admin', 'coordinator'),
  assignVolunteer
);

router.post(
  '/:id/unassign',
  protect,
  authorize('admin', 'coordinator'),
  unassignVolunteer
);

router.post(
  '/:id/complete',
  protect,
  authorize('admin', 'coordinator'),
  completeTask
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteTask
);

module.exports = router;
