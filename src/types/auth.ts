export interface LoginCredentials {
    email: string;
    password: string;
  }

  // Expected response structure from login/register API
export interface AuthResponse {
    token: string;
    // Include other user details if your API returns them
}
  
// Expected error response structure from API
export interface ApiErrorResponse {
      message?: string; // Or 'error', 'detail', etc. depending on your backend
      // Add other potential error fields
}
  