const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getPublishableKey = async () => {
  const response = await fetch(`${API_URL}/subscriptions/publishable-key`);
  if (!response.ok) throw new Error('Failed to get publishable key');
  return response.json();
};

export const getProducts = async () => {
  const response = await fetch(`${API_URL}/subscriptions/products`);
  if (!response.ok) throw new Error('Failed to get products');
  return response.json();
};

export const getSubscription = async () => {
  const response = await fetch(`${API_URL}/subscriptions`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to get subscription');
  return response.json();
};

export const selectPlan = async (priceId) => {
  const response = await fetch(`${API_URL}/subscriptions/select-plan`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ priceId }),
  });
  if (!response.ok) throw new Error('Failed to select plan');
  return response.json();
};

export const createCheckoutSession = async () => {
  const response = await fetch(`${API_URL}/subscriptions/checkout-session`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to create checkout session');
  return response.json();
};

export const createSetupIntent = async () => {
  const response = await fetch(`${API_URL}/subscriptions/setup-intent`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to create setup intent');
  return response.json();
};

export const updateQuantity = async (quantity) => {
  const response = await fetch(`${API_URL}/subscriptions/quantity`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ quantity }),
  });
  if (!response.ok) throw new Error('Failed to update quantity');
  return response.json();
};

export const cancelSubscription = async (atPeriodEnd = true) => {
  const response = await fetch(`${API_URL}/subscriptions/cancel`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ atPeriodEnd }),
  });
  if (!response.ok) throw new Error('Failed to cancel subscription');
  return response.json();
};

export const createPortalSession = async () => {
  const response = await fetch(`${API_URL}/subscriptions/portal-session`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to create portal session');
  return response.json();
};

export const applyCoupon = async (code) => {
  const response = await fetch(`${API_URL}/subscriptions/coupon`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ code }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || 'Failed to apply coupon');
  }
  return data;
};
