const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getVolunteers, getVolunteer, registerVolunteer, updateVolunteer,
  updateStatus, rateVolunteer, getVolunteerStats, deleteVolunteer
} = require('../controllers/volunteerController');

const router = express.Router();

// Public routes
router.get('/stats', getVolunteerStats);
router.get('/', getVolunteers);
router.get('/:id', getVolunteer);
router.post('/', registerVolunteer);

// Protected routes
router.put(
  '/:id',
  protect,
  updateVolunteer
);

router.patch(
  '/:id/status',
  protect,
  authorize('admin', 'coordinator', 'volunteer'),
  updateStatus
);

router.post(
  '/:id/rate',
  protect,
  authorize('admin', 'coordinator'),
  rateVolunteer
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteVolunteer
);

module.exports = router;
