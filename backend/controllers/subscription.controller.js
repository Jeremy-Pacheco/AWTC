const webPush = require('web-push');
const db = require('../models');
const Subscription = db.Subscription;

// Configure web-push with VAPID keys from environment variables
webPush.setVapidDetails(
  'mailto:' + (process.env.VAPID_EMAIL || 'your-email@example.com'),
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Subscribe a user to push notifications
 * @param {Object} req - Express request object with subscription data
 * @param {Object} res - Express response object
 */
const subscribe = async (req, res) => {
  try {
    const { endpoint, expirationTime, keys } = req.body;
    
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.error('Subscribe error: User not authenticated', req.user);
      return res.status(401).json({
        message: 'User not authenticated'
      });
    }
    
    const userId = req.user.id;
    console.log('Subscribing user:', userId, 'to endpoint:', endpoint?.substring(0, 50) + '...');

    // Validate required fields
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      console.error('Subscribe error: Missing fields', { endpoint: !!endpoint, keys: !!keys });
      return res.status(400).json({
        message: 'Missing required subscription fields'
      });
    }

    // Check if subscription already exists
    const existingSubscription = await Subscription.findOne({
      where: { endpoint }
    });

    if (existingSubscription) {
      // Update userId if subscription exists but for different user
      if (existingSubscription.userId !== userId) {
        existingSubscription.userId = userId;
        await existingSubscription.save();
      }
      return res.status(200).json({
        message: 'Subscription already exists',
        subscription: existingSubscription
      });
    }

    // Create new subscription
    const subscription = await Subscription.create({
      userId,
      endpoint,
      expirationTime: expirationTime || null,
      keys: JSON.stringify(keys)
    });

    res.status(201).json({
      message: 'Successfully subscribed to notifications',
      subscription
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      message: 'Error creating subscription',
      error: error.message
    });
  }
};

/**
 * Unsubscribe a user from push notifications
 * @param {Object} req - Express request object with endpoint in body
 * @param {Object} res - Express response object
 */
const unsubscribe = async (req, res) => {
  try {
    const { endpoint } = req.body;
    const userId = req.user.id;

    if (!endpoint) {
      return res.status(400).json({
        message: 'Endpoint is required'
      });
    }

    const deleted = await Subscription.destroy({
      where: {
        endpoint,
        userId
      }
    });

    if (deleted) {
      res.status(200).json({
        message: 'Successfully unsubscribed'
      });
    } else {
      res.status(404).json({
        message: 'Subscription not found'
      });
    }
  } catch (error) {
    console.error('Error deleting subscription:', error);
    res.status(500).json({
      message: 'Error deleting subscription',
      error: error.message
    });
  }
};

/**
 * Get user's current subscriptions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscriptions = await Subscription.findAll({
      where: { userId },
      attributes: ['id', 'endpoint', 'expirationTime', 'createdAt']
    });

    res.status(200).json({
      subscriptions
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({
      message: 'Error fetching subscriptions',
      error: error.message
    });
  }
};

/**
 * Send push notification to a specific user
 * @param {number} userId - Target user ID
 * @param {Object} payload - Notification payload with title, body, icon, etc.
 * @returns {Promise<Object>} Result with success count and errors
 */
const sendNotificationToUser = async (userId, payload) => {
  try {
    console.log(`📬 Sending notification to user ${userId}:`, payload);
    
    // Find all subscriptions for the user
    const subscriptions = await Subscription.findAll({
      where: { userId }
    });

    console.log(`   Found ${subscriptions.length} subscription(s) for user ${userId}`);

    if (subscriptions.length === 0) {
      return {
        success: false,
        message: 'No subscriptions found for user'
      };
    }

    const results = {
      sent: 0,
      failed: 0,
      errors: []
    };

    // Send notification to all user's subscriptions
    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: JSON.parse(subscription.keys)
        };

        await webPush.sendNotification(
          pushSubscription,
          JSON.stringify(payload)
        );

        console.log(`   ✅ Notification sent successfully to endpoint: ${subscription.endpoint.substring(0, 50)}...`);
        results.sent++;
      } catch (error) {
        console.error(`   ❌ Error sending notification to endpoint:`, error.message);
        results.failed++;
        results.errors.push(error.message);

        // If subscription is invalid (410 Gone), delete it
        if (error.statusCode === 410) {
          console.log(`   🗑️  Deleting invalid subscription (410 Gone)`);
          await subscription.destroy();
        }
      }
    }

    console.log(`   📊 Results: ${results.sent} sent, ${results.failed} failed`);

    return {
      success: results.sent > 0,
      ...results
    };
  } catch (error) {
    console.error('❌ Error in sendNotificationToUser:', error);
    return {
      success: false,
      message: error.message
    };
  }
};

/**
 * Test endpoint to send a notification to the current user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
module.exports = {
  subscribe,
  unsubscribe,
  getUserSubscriptions,
  sendNotificationToUser
};
