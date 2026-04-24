const express = require('express');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const {
  getSurveys, getSurvey, submitSurvey, verifySurvey, deleteSurvey, getSurveyStats
} = require('../controllers/surveyController');

const router = express.Router();

// Public routes
router.get('/stats', getSurveyStats);
router.get('/', getSurveys);
router.get('/:id', getSurvey);

// Allow anyone to submit reports (optionally authenticated)
router.post('/', optionalAuth, submitSurvey);

// Protected routes
router.put(
  '/:id/verify',
  protect,
  authorize('admin', 'coordinator'),
  verifySurvey
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteSurvey
);

module.exports = router;
