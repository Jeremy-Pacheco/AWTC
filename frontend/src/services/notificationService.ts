// Notification Service for handling push notification subscriptions

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Get VAPID public key from environment variables
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

/**
 * Convert a base64 string to Uint8Array (required for VAPID key)
 * @param {string} base64String - Base64 encoded string
 * @returns {Uint8Array} Converted array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Check if browser supports notifications
 * @returns {boolean} True if supported
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

/**
 * Get current notification permission status
 * @returns {NotificationPermission} Permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from user
 * @returns {Promise<NotificationPermission>} Permission result
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser');
    return 'denied';
  }

  // Check if we're in a secure context (HTTPS or localhost)
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isSecure = window.location.protocol === 'https:' || isLocalhost;
  
  if (!isSecure) {
    console.warn('Notifications require HTTPS or localhost');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    try {
      // Use the Promise-based API (better for Edge compatibility)
      const permission = await Notification.requestPermission();
      console.log('Notification permission result:', permission);
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  console.warn('Notification permission was previously denied');
  return Notification.permission;
}

/**
 * Register service worker
 * @returns {Promise<ServiceWorkerRegistration>} Service worker registration
 */
async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers not supported');
  }

  // Check for secure context (localhost is always secure)
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (!window.isSecureContext && !isLocalhost) {
    throw new Error('Service workers require a secure context (HTTPS or localhost)');
  }

  try {
    // Check if service worker is already registered
    const existingRegistration = await navigator.serviceWorker.getRegistration('/');
    if (existingRegistration) {
      console.log('Service Worker already registered:', existingRegistration);
      await navigator.serviceWorker.ready;
      return existingRegistration;
    }

    // Register the service worker
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      type: 'classic' // Use classic for better compatibility
    });

    console.log('Service Worker registered successfully:', registration);

    // Wait for the service worker to be ready
    await navigator.serviceWorker.ready;

    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    throw error;
  }
}

/**
 * Subscribe user to push notifications
 * @param {string} token - JWT token for authentication
 * @returns {Promise<PushSubscription | null>} Subscription object or null if failed
 */
export async function subscribeUserToPush(token: string): Promise<PushSubscription | null> {
  try {
    // Check if notifications are supported
    if (!isNotificationSupported()) {
      throw new Error('Push notifications not supported');
    }

    // Check VAPID key
    if (!VAPID_PUBLIC_KEY) {
      throw new Error('VAPID public key not configured');
    }

    // Request permission if not already granted
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }

    // Register service worker
    const registration = await registerServiceWorker();

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      console.log('Already subscribed to push notifications');
      // Still send to server in case it's not stored there
    } else {
      try {
        // Subscribe to push notifications
        const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey
        });

        console.log('New push subscription created');
      } catch (pushError: any) {
        // Handle specific push subscription errors
        if (pushError.name === 'AbortError' || pushError.message?.includes('push service error') || pushError.name === 'NotAllowedError') {
          console.warn('⚠️ Push subscription failed');
          console.warn('📋 Posibles causas:');
          console.warn('   1. Certificados SSL auto-firmados o inválidos');
          console.warn('   2. La página no está servida desde localhost o HTTPS válido');
          console.warn('   3. El navegador bloqueó las notificaciones');
          console.warn('');
          console.warn('✅ Soluciones para desarrollo:');
          console.warn('   • Asegúrate de acceder desde http://localhost:PUERTO');
          console.warn('   • Si usas HTTPS, usa certificados válidos o un túnel (ngrok)');
          console.warn('   • En producción funcionará con SSL válido');
          console.warn('');
          console.warn('Error completo:', pushError.message);
          return null;
        }
        throw pushError; // Re-throw other errors
      }
    }

    // Send subscription to backend
    const response = await fetch(`${API_URL}/api/subscriptions/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to save subscription to server');
    }

    console.log('Subscription saved to server successfully');
    return subscription;

  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
}

/**
 * Unsubscribe user from push notifications
 * @param {string} token - JWT token for authentication
 * @returns {Promise<boolean>} True if unsubscribed successfully
 */
export async function unsubscribeUserFromPush(token: string): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      console.log('No subscription found');
      return true;
    }

    // Unsubscribe from browser
    const unsubscribed = await subscription.unsubscribe();

    if (unsubscribed) {
      // Remove from backend
      await fetch(`${API_URL}/api/subscriptions/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint
        })
      });

      console.log('Unsubscribed from push notifications');
    }

    return unsubscribed;

  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

/**
 * Check if user is currently subscribed
 * @returns {Promise<boolean>} True if subscribed
 */
export async function isSubscribed(): Promise<boolean> {
  try {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    return subscription !== null;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

/**
 * Send test notification (for debugging)
 * @param {string} token - JWT token for authentication
 * @returns {Promise<boolean>} True if test notification sent
 */
export async function sendTestNotification(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_URL}/api/subscriptions/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        title: 'Test from AWTC',
        body: 'This is a test notification!',
        icon: '/logo.png'
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
}
