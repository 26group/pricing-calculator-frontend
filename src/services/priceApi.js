import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/v1';

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  console.log('🔍 Interceptor running for:', config.url);
  const token = localStorage.getItem('token');
  
  console.log('🔍 Token from localStorage:', token ? token.substring(0, 20) + '...' : 'NONE');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('📤 Authorization header set');
  } else {
    console.warn('⚠️ No token found in localStorage');
    console.log('🔍 All localStorage keys:', Object.keys(localStorage));
  }
  return config;
});

/**
 * Create a new price record
 * @param {Object} priceData - The price data to save
 * @returns {Promise<Object>} The created price record
 */
export const createPrice = async (priceData) => {
  try {
    const response = await api.post('/prices', priceData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get all prices for the current user
 * @param {Object} options - Query options (sortBy, limit, page)
 * @returns {Promise<Object>} Paginated list of prices
 */
export const getPrices = async (options = {}) => {
  try {
    const response = await api.get('/prices', { params: options });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Get a specific price by ID
 * @param {string} priceId - The price ID
 * @returns {Promise<Object>} The price record
 */
export const getPrice = async (priceId) => {
  try {
    const response = await api.get(`/prices/${priceId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update a price record
 * @param {string} priceId - The price ID
 * @param {Object} updateData - The data to update
 * @returns {Promise<Object>} The updated price record
 */
export const updatePrice = async (priceId, updateData) => {
  try {
    const response = await api.patch(`/prices/${priceId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Delete a price record
 * @param {string} priceId - The price ID
 * @returns {Promise<void>}
 */
export const deletePrice = async (priceId) => {
  try {
    await api.delete(`/prices/${priceId}`);
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  createPrice,
  getPrices,
  getPrice,
  updatePrice,
  deletePrice,
};
