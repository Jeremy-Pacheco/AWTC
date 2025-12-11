const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const requireAuth = require('../middlewares/requireAuth');

// Middleware to verify user is admin or coordinator
const requireMessagingRole = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'coordinator') {
    return res.status(403).json({ error: 'Only administrators and coordinators can use messaging' });
  }

  next();
};

// All routes require authentication
router.use(requireAuth);

/**
 * @route POST /api/subscriptions/subscribe
 * @desc Subscribe user to push notifications
 * @access Private (All authenticated users)
 */
router.post('/subscribe', subscriptionController.subscribe);

/**
 * @route POST /api/subscriptions/unsubscribe
 * @desc Unsubscribe user from push notifications
 * @access Private (All authenticated users)
 */
router.post('/unsubscribe', subscriptionController.unsubscribe);

/**
 * @route GET /api/subscriptions
 * @desc Get current user's subscriptions
 * @access Private (All authenticated users)
 */
router.get('/', subscriptionController.getUserSubscriptions);

// Routes requiring admin/coordinator role
router.use(requireMessagingRole);

/**
 * @route POST /api/subscriptions/test
 * @desc Send test notification to current user
 * @access Private (Admin/Coordinator only)
 */
router.post('/test', subscriptionController.testNotification);

module.exports = router;
