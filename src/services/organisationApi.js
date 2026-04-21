import { handleSessionExpired, tryRefreshToken } from '../utils/sessionManager';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper to handle 401 responses with token refresh
const handleResponseWithRefresh = async (response, fetchFn, errorMessage) => {
  if (response.status === 401) {
    // Try to refresh the token
    const newToken = await tryRefreshToken();
    if (newToken) {
      // Retry the request with the new token
      const retryResponse = await fetchFn();
      if (retryResponse.status === 401) {
        handleSessionExpired();
        throw new Error('Session expired');
      }
      if (!retryResponse.ok) {
        const errorData = await retryResponse.json().catch(() => ({}));
        throw new Error(errorData.message || errorMessage);
      }
      return retryResponse.json();
    }
    handleSessionExpired();
    throw new Error('Session expired');
  }
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorMessage);
  }
  return response.json();
};

export const getOrganisation = async () => {
  const fetchOrg = () => fetch(`${API_URL}/organisations/me?_t=${Date.now()}`, {
    headers: getAuthHeaders(),
  });
  
  const response = await fetchOrg();
  
  if (response.status === 401) {
    const newToken = await tryRefreshToken();
    if (newToken) {
      const retryResponse = await fetchOrg();
      if (retryResponse.status === 401) {
        handleSessionExpired();
        throw new Error('Session expired');
      }
      if (!retryResponse.ok) {
        if (retryResponse.status === 404) return null;
        throw new Error('Failed to get organisation');
      }
      return retryResponse.json();
    }
    handleSessionExpired();
    throw new Error('Session expired');
  }
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to get organisation');
  }
  return response.json();
};

export const createOrganisation = async (name) => {
  const fetchCreate = () => fetch(`${API_URL}/organisations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  
  const response = await fetchCreate();
  return handleResponseWithRefresh(response, fetchCreate, 'Failed to create organisation');
};

export const updateOrganisation = async (id, data) => {
  const response = await fetch(`${API_URL}/organisations/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response, 'Failed to update organisation');
};

export const getMembers = async (orgId) => {
  const response = await fetch(`${API_URL}/organisations/${orgId}/members`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response, 'Failed to get members');
};

export const inviteMember = async (orgId, email) => {
  const response = await fetch(`${API_URL}/organisations/${orgId}/members/invite`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email }),
  });
  return handleResponse(response, 'Failed to invite member');
};

export const removeMember = async (orgId, userId) => {
  const response = await fetch(`${API_URL}/organisations/${orgId}/members/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return handleResponse(response, 'Failed to remove member');
};

export const resendInvite = async (orgId, email) => {
  const response = await fetch(`${API_URL}/organisations/${orgId}/members/invite/resend`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email }),
  });
  return handleResponse(response, 'Failed to resend invite');
};

export const updateMemberRole = async (orgId, userId, role) => {
  const response = await fetch(`${API_URL}/organisations/${orgId}/members/${userId}/role`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });
  return handleResponse(response, 'Failed to update member role');
};
