/**
 * Session Manager - handles token expiration and session management
 */

// Session expired flag key in sessionStorage (not localStorage so it clears on tab close)
const SESSION_EXPIRED_KEY = 'sessionExpired';
const SESSION_EXPIRED_MESSAGE_KEY = 'sessionExpiredMessage';

/**
 * Mark the session as expired and trigger redirect
 * @param {string} message - Optional custom message
 */
export const handleSessionExpired = (message = 'Your session has expired. Please log in again.') => {
  // Clear the token
  localStorage.removeItem('token');
  
  // Set session expired flag
  sessionStorage.setItem(SESSION_EXPIRED_KEY, 'true');
  sessionStorage.setItem(SESSION_EXPIRED_MESSAGE_KEY, message);
  
  // Redirect to login
  window.location.href = '/login';
};

/**
 * Check if session just expired (for showing message on login page)
 * @returns {string|null} - The expired message or null
 */
export const getSessionExpiredMessage = () => {
  const isExpired = sessionStorage.getItem(SESSION_EXPIRED_KEY);
  const message = sessionStorage.getItem(SESSION_EXPIRED_MESSAGE_KEY);
  
  if (isExpired) {
    // Clear the flag after reading
    sessionStorage.removeItem(SESSION_EXPIRED_KEY);
    sessionStorage.removeItem(SESSION_EXPIRED_MESSAGE_KEY);
    return message || 'Your session has expired. Please log in again.';
  }
  
  return null;
};

/**
 * Handle API response - check for 401 errors
 * @param {Response} response - Fetch response object
 * @returns {Response} - The same response for chaining
 */
export const handleApiResponse = (response) => {
  if (response.status === 401) {
    handleSessionExpired();
    throw new Error('Session expired');
  }
  return response;
};

/**
 * Create a fetch wrapper that handles session expiration
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export const fetchWithSessionHandling = async (url, options = {}) => {
  const response = await fetch(url, options);
  return handleApiResponse(response);
};

export default {
  handleSessionExpired,
  getSessionExpiredMessage,
  handleApiResponse,
  fetchWithSessionHandling,
};
