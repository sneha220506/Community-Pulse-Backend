const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  matchForNeed, matchAll, matchForVolunteer, confirmMatch
} = require('../controllers/matchingController');

const router = express.Router();

// Public routes - anyone can run the matching algorithm
router.post('/need/:needId', matchForNeed);
router.post('/all', matchAll);
router.post('/volunteer/:volunteerId', matchForVolunteer);

// Protected - only admins/coordinators can confirm matches
router.post(
  '/confirm',
  protect,
  authorize('admin', 'coordinator'),
  confirmMatch
);

module.exports = router;
