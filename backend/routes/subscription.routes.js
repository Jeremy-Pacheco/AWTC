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
 * @swagger
 * /api/subscriptions/subscribe:
 *   post:
 *     summary: Subscribe user to push notifications
 *     description: Register device for push notifications (All authenticated users)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               endpoint:
 *                 type: string
 *                 example: "https://fcm.googleapis.com/..."
 *               auth:
 *                 type: string
 *                 example: "auth_key"
 *               p256dh:
 *                 type: string
 *                 example: "p256dh_key"
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *       400:
 *         description: Invalid subscription data
 *       401:
 *         description: Unauthorized - No valid token
 */
router.post('/subscribe', subscriptionController.subscribe);

/**
 * @swagger
 * /api/subscriptions/unsubscribe:
 *   post:
 *     summary: Unsubscribe user from push notifications
 *     description: Remove device from push notifications (All authenticated users)
 *     tags: [Subscriptions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               endpoint:
 *                 type: string
 *                 example: "https://fcm.googleapis.com/..."
 *     responses:
 *       200:
 *         description: Unsubscribed successfully
 *       401:
 *         description: Unauthorized - No valid token
 */
router.post('/unsubscribe', subscriptionController.unsubscribe);

/**
 * @swagger
 * /api/subscriptions:
 *   get:
 *     summary: Get current user's subscriptions
 *     description: Get list of all push notification subscriptions for the authenticated user
 *     tags: [Subscriptions]
 *     security: []
 *     responses:
 *       200:
 *         description: List of subscriptions
 *       401:
 *         description: Unauthorized - No valid token
 */
router.get('/', subscriptionController.getUserSubscriptions);

// Routes requiring admin/coordinator role
router.use(requireMessagingRole);

module.exports = router;
