import { handleSessionExpired } from '../utils/sessionManager';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('📤 organisationApi token:', token ? token.substring(0, 30) + '...' : 'NONE');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper to handle 401 responses
const handleResponse = async (response, errorMessage) => {
  if (response.status === 401) {
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
  // Add timestamp to prevent browser caching
  const response = await fetch(`${API_URL}/organisations/me?_t=${Date.now()}`, {
    headers: getAuthHeaders(),
  });
  if (response.status === 401) {
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
  const response = await fetch(`${API_URL}/organisations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  return handleResponse(response, 'Failed to create organisation');
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
  console.log('📤 inviteMember API call:', { orgId, email });
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
