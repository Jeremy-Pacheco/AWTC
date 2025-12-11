const socketIO = require('socket.io');
const db = require('../models');

let io;

// Store active user connections
const userSockets = new Map(); // userId -> socketId

function initializeSocketIO(server) {
  io = socketIO(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:8080",
        "http://209.97.187.131:5173",
        "http://209.97.187.131:8080"
      ],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const userId = socket.handshake.auth.userId;
      const userRole = socket.handshake.auth.userRole;

      if (!userId || !userRole) {
        return next(new Error('Authentication error'));
      }

      // Verify that user exists and has admin or coordinator role
      const user = await db.User.findByPk(userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      if (user.role !== 'admin' && user.role !== 'coordinator') {
        return next(new Error('Unauthorized: Only admins and coordinators can use messaging'));
      }

      socket.userId = userId;
      socket.userRole = user.role;
      socket.userName = user.name;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userName} (ID: ${socket.userId})`);
    
    // Register user socket
    userSockets.set(socket.userId, socket.id);

    // Notify user that they are connected
    socket.emit('connected', {
      message: 'Connected to messaging system',
      userId: socket.userId,
      userName: socket.userName
    });

    // Emit list of connected users to everyone
    emitOnlineUsers();

    // Event: Send message
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, content } = data;

        if (!receiverId || !content) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }

        // Verify that receiver exists and is admin or coordinator
        const receiver = await db.User.findByPk(receiverId);
        
        if (!receiver) {
          socket.emit('error', { message: 'Receiver not found' });
          return;
        }

        if (receiver.role !== 'admin' && receiver.role !== 'coordinator') {
          socket.emit('error', { message: 'Can only send messages to admins and coordinators' });
          return;
        }

        // Save message to database
        const message = await db.Message.create({
          senderId: socket.userId,
          receiverId: parseInt(receiverId),
          content: content.trim(),
          isRead: false
        });

        // Load relationships to send complete data
        const fullMessage = await db.Message.findByPk(message.id, {
          include: [
            { model: db.User, as: 'sender', attributes: ['id', 'name', 'email', 'role', 'profileImage'] },
            { model: db.User, as: 'receiver', attributes: ['id', 'name', 'email', 'role', 'profileImage'] }
          ]
        });

        // Emit to sender (confirmation)
        socket.emit('message_sent', fullMessage);

        // Emit to receiver if connected
        const receiverSocketId = userSockets.get(parseInt(receiverId));
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', fullMessage);
        }

        console.log(`Message from ${socket.userName} to user ${receiverId}: ${content.substring(0, 50)}...`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Event: Mark message as read
    socket.on('mark_as_read', async (data) => {
      try {
        const { messageId } = data;

        const message = await db.Message.findByPk(messageId);
        
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Only receiver can mark as read
        if (message.receiverId !== socket.userId) {
          socket.emit('error', { message: 'Unauthorized to mark this message as read' });
          return;
        }

        message.isRead = true;
        await message.save();

        socket.emit('message_read', { messageId });

        // Notify sender
        const senderSocketId = userSockets.get(message.senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('message_read_by_receiver', { messageId });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    // Event: User is typing
    socket.on('typing', (data) => {
      const { receiverId } = data;
      const receiverSocketId = userSockets.get(parseInt(receiverId));
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          userId: socket.userId,
          userName: socket.userName
        });
      }
    });

    // Event: User stopped typing
    socket.on('stop_typing', (data) => {
      const { receiverId } = data;
      const receiverSocketId = userSockets.get(parseInt(receiverId));
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_stop_typing', {
          userId: socket.userId
        });
      }
    });

    // Event: Disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userName} (ID: ${socket.userId})`);
      userSockets.delete(socket.userId);
      emitOnlineUsers();
    });
  });

  // Helper function to emit connected users
  function emitOnlineUsers() {
    const onlineUserIds = Array.from(userSockets.keys());
    io.emit('online_users', { userIds: onlineUserIds });
  }

  return io;
}

function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
}

module.exports = {
  initializeSocketIO,
  getIO
};
