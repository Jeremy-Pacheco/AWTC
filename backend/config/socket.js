const socketIO = require('socket.io');
const db = require('../models');
const { sendNotificationToUser } = require('../controllers/subscription.controller');

let io;
let reviewsNamespace;

// Store active user connections
const userSockets = new Map(); // userId -> socketId

function initializeSocketIO(server) {
  io = socketIO(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:8080",
        "https://localhost:5173",
        "https://localhost:8443",
        "http://209.97.187.131:5173",
        "http://209.97.187.131:8080",
        "https://209.97.187.131",
        "http://awilltochange.me:5173",
        "http://awilltochange.me:8080",
        "https://awilltochange.me:5173",
        "https://awilltochange.me:8080",
        "http://awilltochange.me",
        "https://awilltochange.me",
        "https://awtc.com",
        "https://www.awtc.com"
      ],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Namespace público para Reviews (sin autenticación)
  reviewsNamespace = io.of('/reviews');
  reviewsNamespace.on('connection', (socket) => {
    console.log('Reviews socket connected');
    socket.emit('connected', { message: 'Connected to reviews events' });
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    try {
      const userId = socket.handshake.auth.userId;
      const userRole = socket.handshake.auth.userRole;

      // Allow connections without auth for public events (like review_deleted)
      if (!userId || !userRole) {
        console.log('Public socket connection (no auth)');
        socket.isPublic = true;
        return next();
      }

      // Verify that user exists and has admin or coordinator role for messaging
      const user = await db.User.findByPk(userId);
      
      if (!user) {
        return next(new Error('User not found'));
      }

      if (user.role !== 'admin' && user.role !== 'coordinator') {
        // Allow regular users to connect but not use messaging
        socket.userId = userId;
        socket.userRole = user.role;
        socket.userName = user.name;
        socket.isRegularUser = true;
        return next();
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
    if (socket.isPublic) {
      console.log('Public socket connected (listening to broadcasts only)');
      socket.emit('connected', { message: 'Connected to public events' });
      return; // Don't register messaging handlers for public connections
    }

    console.log(`User connected: ${socket.userName} (ID: ${socket.userId})`);
    
    // Register user socket with page info
    userSockets.set(socket.userId, {
      socketId: socket.id,
      currentPage: null // Will be updated by client
    });

    // Notify user that they are connected
    socket.emit('connected', {
      message: 'Connected to messaging system',
      userId: socket.userId,
      userName: socket.userName
    });

    // Emit list of connected users to everyone
    emitOnlineUsers();

    // Event: Update current page
    socket.on('update_page', (data) => {
      const { page } = data;
      const userSocket = userSockets.get(socket.userId);
      if (userSocket) {
        userSocket.currentPage = page;
        console.log(`User ${socket.userName} is now on page: ${page}`);
      }
    });

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
        const receiverSocket = userSockets.get(parseInt(receiverId));
        const isReceiverOnline = !!receiverSocket;
        const isReceiverOnMessagesPage = receiverSocket?.currentPage === '/messages';
        
        if (receiverSocket) {
          io.to(receiverSocket.socketId).emit('receive_message', fullMessage);
        }

        // Send push notification if receiver is not connected OR not on messages page
        const shouldSendPushNotification = !isReceiverOnline || !isReceiverOnMessagesPage;
        
        if (shouldSendPushNotification) {
          try {
            // Send push notification to receiver
            await sendNotificationToUser(parseInt(receiverId), {
              title: `New message from ${socket.userName}`,
              body: content.length > 100 ? content.substring(0, 100) + '...' : content,
              icon: '/logo.png',
              tag: `message-${message.id}`,
              data: {
                url: '/messages',
                messageId: message.id,
                senderId: socket.userId
              }
            });
            console.log(`Push notification sent to user ${receiverId} (online: ${isReceiverOnline}, on messages: ${isReceiverOnMessagesPage})`);
          } catch (error) {
            console.error('Error sending push notification:', error);
          }
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
        const senderSocket = userSockets.get(message.senderId);
        if (senderSocket) {
          io.to(senderSocket.socketId).emit('message_read_by_receiver', { messageId });
        }
      } catch (error) {
        console.error('Error marking message as read:', error);
        socket.emit('error', { message: 'Failed to mark message as read' });
      }
    });

    // Event: User is typing
    socket.on('typing', (data) => {
      const { receiverId } = data;
      const receiverSocket = userSockets.get(parseInt(receiverId));
      
      if (receiverSocket) {
        io.to(receiverSocket.socketId).emit('user_typing', {
          userId: socket.userId,
          userName: socket.userName
        });
      }
    });

    // Event: User stopped typing
    socket.on('stop_typing', (data) => {
      const { receiverId } = data;
      const receiverSocket = userSockets.get(parseInt(receiverId));
      
      if (receiverSocket) {
        io.to(receiverSocket.socketId).emit('user_stop_typing', {
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

function getReviewsNS() {
  if (!reviewsNamespace) {
    throw new Error('Reviews namespace not initialized');
  }
  return reviewsNamespace;
}

module.exports = {
  initializeSocketIO,
  getIO,
  getReviewsNS
};
