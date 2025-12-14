const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
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

// All routes require authentication and appropriate role
router.use(requireAuth);
router.use(requireMessagingRole);

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get conversation list
 *     description: Retrieve all conversations for the authenticated user (Admin/Coordinator only)
 *     tags: [Messages]
 *     security: []
 *     responses:
 *       200:
 *         description: List of conversations
 *       401:
 *         description: Unauthorized - No valid token
 *       403:
 *         description: Forbidden - User must be admin or coordinator
 */
router.get('/conversations', messageController.getConversations);

/**
 * @swagger
 * /api/messages/history/{userId}:
 *   get:
 *     summary: Get message history with a user
 *     description: Retrieve all messages exchanged with a specific user (Admin/Coordinator only)
 *     tags: [Messages]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the user to get messages with
 *     responses:
 *       200:
 *         description: Message history
 *       401:
 *         description: Unauthorized - No valid token
 *       403:
 *         description: Forbidden - User must be admin or coordinator
 */
router.get('/history/:userId', messageController.getMessageHistory);

/**
 * @swagger
 * /api/messages/{messageId}/read:
 *   put:
 *     summary: Mark message as read
 *     description: Mark a specific message as read (Admin/Coordinator only)
 *     tags: [Messages]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the message to mark as read
 *     responses:
 *       200:
 *         description: Message marked as read
 *       401:
 *         description: Unauthorized - No valid token
 *       403:
 *         description: Forbidden - User must be admin or coordinator
 */
router.put('/:messageId/read', messageController.markAsRead);

/**
 * @swagger
 * /api/messages/unread-count:
 *   get:
 *     summary: Get unread messages count
 *     description: Get the count of unread messages for the authenticated user (Admin/Coordinator only)
 *     tags: [Messages]
 *     security: []
 *     responses:
 *       200:
 *         description: Count of unread messages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unreadCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized - No valid token
 *       403:
 *         description: Forbidden - User must be admin or coordinator
 */
router.get('/unread-count', messageController.getUnreadCount);

/**
 * @swagger
 * /api/messages/available-users:
 *   get:
 *     summary: Get available users for messaging
 *     description: Get list of users available for messaging (Admin/Coordinator only)
 *     tags: [Messages]
 *     security: []
 *     responses:
 *       200:
 *         description: List of available users
 *       401:
 *         description: Unauthorized - No valid token
 *       403:
 *         description: Forbidden - User must be admin or coordinator
 */
router.get('/available-users', messageController.getAvailableUsers);

module.exports = router;
