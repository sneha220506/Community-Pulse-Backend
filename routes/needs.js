const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getNeeds, getNeed, createNeed, updateNeed, deleteNeed, verifyNeed, getNeedStats,
  getCriticalNeeds
} = require('../controllers/needController');

const router = express.Router();

// Public routes
router.get('/stats', getNeedStats);
router.get('/', getNeeds);
router.get('/getcriticalneeds', getCriticalNeeds);
router.get('/:id', getNeed);

// Protected routes
router.post(
  '/',
  protect,
  authorize('admin'),
  createNeed
);

router.put(
  '/:id',
  protect,
  authorize('admin', 'coordinator'),
  updateNeed
);

router.put(
  '/:id/verify',
  protect,
  authorize('admin', 'coordinator'),
  verifyNeed
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  deleteNeed
);

module.exports = router;
