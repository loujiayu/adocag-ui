// Environment-based configuration
const PRODUCTION_BASE_URL = 'https://adocag2-cmbnhrc4hncze7hd.eastus2-01.azurewebsites.net';
const DEVELOPMENT_BASE_URL = 'http://localhost:8080';

// Base URL that switches based on environment
export const BASE_URL = process.env.NODE_ENV === 'production' 
  ? PRODUCTION_BASE_URL
  : DEVELOPMENT_BASE_URL;

// API endpoints that can be used throughout the application
export const API_ENDPOINTS = {
  chat: `${BASE_URL}/api/chat`,
  search: `${BASE_URL}/api/search`,
};

// Function to get the full API URL for a specific endpoint
export const getApiUrl = (endpoint: keyof typeof API_ENDPOINTS) => {
  return API_ENDPOINTS[endpoint];
};