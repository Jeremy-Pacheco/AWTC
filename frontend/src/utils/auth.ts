/**
 * Authentication utility functions
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Clears all authentication data from localStorage
 */
export function clearAuth() {
  localStorage.removeItem('jwtToken');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userProfileImage');
  
  // Notify other components
  window.dispatchEvent(new CustomEvent('authChanged', { detail: { loggedIn: false } }));
  try {
    localStorage.setItem('__auth_last_update', Date.now().toString());
  } catch {}
}

/**
 * Checks if the JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return true;
    
    const payload = JSON.parse(atob(parts[1]));
    if (!payload.exp) return false; // No expiration set
    
    // Check if token is expired (with 1 minute buffer)
    return Date.now() >= payload.exp * 1000 - 60000;
  } catch {
    return true;
  }
}

/**
 * Validates the current authentication status
 * Returns true if valid, false if expired or invalid
 */
export function validateAuth(): boolean {
  const token = localStorage.getItem('jwtToken');
  
  if (!token) {
    clearAuth();
    return false;
  }
  
  if (isTokenExpired(token)) {
    console.warn('JWT token has expired. Clearing authentication.');
    clearAuth();
    return false;
  }
  
  return true;
}

/**
 * Makes an authenticated fetch request with automatic token validation
 * and 401 error handling
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Validate token before making request
  const token = localStorage.getItem('jwtToken');
  
  if (!token || isTokenExpired(token)) {
    clearAuth();
    throw new Error('Session expired. Please log in again.');
  }
  
  // Add authorization header
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // Handle 401 Unauthorized - token invalid or expired
  if (response.status === 401) {
    console.warn('Received 401 Unauthorized. Clearing authentication.');
    clearAuth();
    throw new Error('Session expired. Please log in again.');
  }
  
  return response;
}

/**
 * Handles fetch response and checks for 401 errors
 * Use this as a wrapper for any fetch call that uses Bearer token
 */
export async function handleAuthFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(url, options);
  
  // Handle 401 Unauthorized - token invalid or expired
  if (response.status === 401) {
    console.warn('Received 401 Unauthorized. Session expired. Clearing authentication.');
    clearAuth();
    
    // Redirect to home after a short delay to allow state updates
    setTimeout(() => {
      if (window.location.pathname !== '/' && window.location.pathname !== '/home') {
        window.location.href = '/';
      }
    }, 100);
  }
  
  return response;
}

/**
 * Initializes authentication check on page load
 * Call this once when the app starts
 */
export function initAuthCheck() {
  const token = localStorage.getItem('jwtToken');
  
  if (token && isTokenExpired(token)) {
    console.warn('Found expired token on page load. Clearing authentication.');
    clearAuth();
  }
}

