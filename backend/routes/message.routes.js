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

// Get conversation list
router.get('/conversations', messageController.getConversations);

// Get message history with specific user
router.get('/history/:userId', messageController.getMessageHistory);

// Mark message as read
router.put('/:messageId/read', messageController.markAsRead);

// Obtener cantidad de mensajes no leídos
router.get('/unread-count', messageController.getUnreadCount);

// Obtener usuarios disponibles para mensajería
router.get('/available-users', messageController.getAvailableUsers);

module.exports = router;
