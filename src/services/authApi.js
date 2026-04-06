const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
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
};
