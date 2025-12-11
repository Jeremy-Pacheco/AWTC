const db = require('../models');
const { Op } = require('sequelize');

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get user's conversation list
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *       401:
 *         description: Unauthorized
 */
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all messages where user is sender or receiver
    const messages = await db.Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        { model: db.User, as: 'sender', attributes: ['id', 'name', 'email', 'role', 'profileImage'] },
        { model: db.User, as: 'receiver', attributes: ['id', 'name', 'email', 'role', 'profileImage'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Group messages by conversation (with the other user)
    const conversationsMap = new Map();

    messages.forEach(message => {
      const otherUserId = message.senderId === userId ? message.receiverId : message.senderId;
      const otherUser = message.senderId === userId ? message.receiver : message.sender;

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          userId: otherUser.id,
          userName: otherUser.name,
          userEmail: otherUser.email,
          userRole: otherUser.role,
          profileImage: otherUser.profileImage ? `/images/${otherUser.profileImage}` : null,
          lastMessage: message.content,
          lastMessageDate: message.createdAt,
          unreadCount: 0
        });
      }

      // Count unread messages received from this user
      if (message.receiverId === userId && !message.isRead) {
        conversationsMap.get(otherUserId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());
    
    // Sort by last message date
    conversations.sort((a, b) => new Date(b.lastMessageDate) - new Date(a.lastMessageDate));

    res.json(conversations);
  } catch (error) {
    console.error('Error getting conversations:', error);
    res.status(500).json({ error: 'Error retrieving conversations' });
  }
};

/**
 * @swagger
 * /api/messages/history/{userId}:
 *   get:
 *     summary: Get message history with a specific user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message history
 *       401:
 *         description: Unauthorized
 */
exports.getMessageHistory = async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = parseInt(req.params.userId);

    const messages = await db.Message.findAll({
      where: {
        [Op.or]: [
          { senderId: currentUserId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: currentUserId }
        ]
      },
      include: [
        { model: db.User, as: 'sender', attributes: ['id', 'name', 'email', 'role', 'profileImage'] },
        { model: db.User, as: 'receiver', attributes: ['id', 'name', 'email', 'role', 'profileImage'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(messages);
  } catch (error) {
    console.error('Error getting message history:', error);
    res.status(500).json({ error: 'Error retrieving message history' });
  }
};

/**
 * @swagger
 * /api/messages/{messageId}/read:
 *   put:
 *     summary: Mark a message as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Message marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Message not found
 */
exports.markAsRead = async (req, res) => {
  try {
    const messageId = parseInt(req.params.messageId);
    const userId = req.user.id;

    const message = await db.Message.findByPk(messageId);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Only receiver can mark as read
    if (message.receiverId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to mark this message as read' });
    }

    message.isRead = true;
    await message.save();

    res.json({ message: 'Message marked as read', data: message });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ error: 'Error marking message as read' });
  }
};

/**
 * @swagger
 * /api/messages/unread-count:
 *   get:
 *     summary: Get total count of unread messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Count of unread messages
 *       401:
 *         description: Unauthorized
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await db.Message.count({
      where: {
        receiverId: userId,
        isRead: false
      }
    });

    res.json({ unreadCount: count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Error retrieving unread message count' });
  }
};

/**
 * @swagger
 * /api/messages/available-users:
 *   get:
 *     summary: Get list of available users for messaging (only admins and coordinators)
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of available users
 *       401:
 *         description: Unauthorized
 */
exports.getAvailableUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id;

    // Only admins and coordinators can send/receive messages
    const users = await db.User.findAll({
      where: {
        id: { [Op.ne]: currentUserId }, // Exclude current user
        role: { [Op.in]: ['admin', 'coordinator'] }
      },
      attributes: ['id', 'name', 'email', 'role', 'profileImage'],
      order: [['name', 'ASC']]
    });

    // Format profileImage with full path
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profileImage: user.profileImage ? `/images/${user.profileImage}` : null
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Error getting available users:', error);
    res.status(500).json({ error: 'Error retrieving available users' });
  }
};
