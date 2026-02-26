/**
 * Get base URL from environment (WITHOUT /api)
 */ 
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

/**
 *  /api prefix for all API calls
 */ 
export const API_BASE = `${BACKEND_URL}/api`;
/**
 * Centralized API endpoints
 */
export const API_ENDPOINTS = {
  // Admin endpoints
  adminLogin: `${API_BASE}/admin/auth/login`,
  adminVerify: `${API_BASE}/admin/auth/verify`,
  adminLogout: `${API_BASE}/admin/auth/logout`,
  
  // Menu endpoints
  menu: `${API_BASE}/menu`,
  uploadImage: `${API_BASE}/upload/image`,
  listImages: `${API_BASE}/upload/images`,
  deleteImage: `${API_BASE}/upload/image`,
  
  // Auth endpoints
  authMe: `${API_BASE}/auth/me`,
  authGoogle: `${API_BASE}/auth/google`,

  // Usesrs endpoints
  users: `${API_BASE}/admin/users`,  
};

/**
 * Helper for authenticated requests
 */
export const fetchWithAuth = async (url: string, options?: RequestInit) => {
  const token = localStorage.getItem('adminToken');
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  });
};