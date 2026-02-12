import { API_URL, getAuthHeaders } from '../config/api';

interface AuthResponse {
  success: boolean;
  token: string;
  user: any;
  message: string;
}

class AuthService {
  private getAuthHeaders = getAuthHeaders;

  private async handleResponse(response: Response) {
    const contentType = response.headers.get('content-type');
    
    // Check if response is JSON
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    // Handle non-JSON responses (like rate limit HTML pages)
    const text = await response.text();
    
    if (response.status === 429) {
      throw new Error('Too many requests. Please wait a moment and try again.');
    }
    
    throw new Error(text || 'An error occurred');
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email, password })
    });

    const data = await this.handleResponse(response);

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    return data;
  }

  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ name, email, password })
    });

    const data = await this.handleResponse(response);

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  }

  async getCurrentUser(): Promise<any> {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    const data = await this.handleResponse(response);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user');
    }

    return data;
  }

  async updateProfile(profileData: any): Promise<any> {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData)
    });

    const data = await this.handleResponse(response);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update profile');
    }

    return data;
  }
}

export const authService = new AuthService();