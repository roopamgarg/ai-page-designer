/**
 * API Key Management Utility
 * Handles storing and retrieving API keys from localStorage
 */

const API_KEY_STORAGE_KEY = 'gemini_api_key';

/**
 * Get the stored API key from localStorage
 */
export function getStoredApiKey(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to read API key from localStorage:', error);
    return null;
  }
}

/**
 * Store the API key in localStorage
 */
export function storeApiKey(apiKey: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
  } catch (error) {
    console.error('Failed to store API key in localStorage:', error);
    throw new Error('Failed to save API key. Please check your browser settings.');
  }
}

/**
 * Remove the stored API key from localStorage
 */
export function clearStoredApiKey(): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear API key from localStorage:', error);
  }
}

/**
 * Check if an API key is stored
 */
export function hasStoredApiKey(): boolean {
  const key = getStoredApiKey();
  return key !== null && key.trim().length > 0;
}

