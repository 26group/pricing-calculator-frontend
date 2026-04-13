const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

/**
 * Refresh the access token using the refresh token
 * @returns {Promise<string|null>} - The new access token or null if refresh failed
 */
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    console.log('No refresh token available');
    return null;
  }
  
  try {
    const response = await fetch(`${API_URL}/auth/refresh-tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.access && data.access.token) {
        localStorage.setItem('token', data.access.token);
        if (data.refresh && data.refresh.token) {
          localStorage.setItem('refreshToken', data.refresh.token);
        }
        console.log('Token refreshed successfully');
        return data.access.token;
      }
    }
    
    console.log('Token refresh failed:', response.status);
    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
};

export const logout = async () => {
  try {
    // Get refresh token - for now, we'll try logout without it
    // Backend will handle 401s if token is invalid
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') || '' }),
    });
    
    // Even if logout fails, we'll still clear local state
    // (user could have invalid/expired refresh token)
    if (!response.ok && response.status !== 401 && response.status !== 404) {
      console.error('Logout API error:', response.status);
    }
  } catch (error) {
    console.error('Logout API call failed:', error.message);
    // Continue with local logout even if API call fails
  }
};

export default {
  logout,
  refreshAccessToken,
};
