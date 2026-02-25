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

  async register(name: string, email: string, password: string, chNo?: string): Promise<AuthResponse> {
    const body: any = { name, email, password };
    if (chNo) {
      body.chNo = chNo;
    }
    
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body)
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

  async forgotPassword(email: string): Promise<any> {
    const response = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ email })
    });

    const data = await this.handleResponse(response);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send reset email');
    }

    return data;
  }

  async completeOnboarding(onboardingData: any): Promise<any> {
    // Transform the data to match backend expectations
    const formData = new FormData();
    
    // Add basic info
    if (onboardingData.age) formData.append('age', onboardingData.age.toString());
    if (onboardingData.height) formData.append('height', onboardingData.height.toString());
    if (onboardingData.weight) formData.append('weight', onboardingData.weight.toString());
    if (onboardingData.gender) formData.append('gender', onboardingData.gender);
    
    // Transform stress assessment data if present
    if (onboardingData.stressAnswers && onboardingData.stressAnswers.length > 0) {
      const totalScore = onboardingData.stressAnswers.reduce((sum: number, ans: number) => sum + ans, 0);
      
      // Convert percentage to stress level category
      let stressLevelCategory = 'low';
      if (onboardingData.stressLevel > 70) stressLevelCategory = 'high';
      else if (onboardingData.stressLevel > 50) stressLevelCategory = 'moderate';
      else if (onboardingData.stressLevel > 30) stressLevelCategory = 'mild';
      
      const stressAssessment = {
        responses: onboardingData.stressAnswers.map((score: number, index: number) => ({
          question: `Question ${index + 1}`,
          score: score,
          category: 'emotional' // Default category
        })),
        totalScore: totalScore,
        stressLevel: stressLevelCategory,
        primaryStressSource: 'emotional' // Default
      };
      
      formData.append('stressAssessment', JSON.stringify(stressAssessment));
    }
    
    const response = await fetch(`${API_URL}/auth/complete-onboarding`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    });

    const data = await this.handleResponse(response);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to complete onboarding');
    }

    return data;
  }
}

export const authService = new AuthService();