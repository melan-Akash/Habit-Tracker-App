import { API_BASE_URL } from './api-config';
import { Habit } from '../types/database.type';

// Helper for standard HTTP request with JWT token header
const request = async (endpoint: string, options: RequestInit = {}, token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'API Request failed');
    }
    return data;
  } catch (error: any) {
    console.warn(`⚠️ API Call [${endpoint}] Error:`, error.message);
    throw error;
  }
};

// Authentication Endpoints
export const authAPI = {
  register: (userData: { name: string; email: string; password: string }) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials: { email: string; password: string }) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: (token: string) => request('/auth/me', { method: 'GET' }, token),
};

// Habit Endpoints
export const habitAPI = {
  getHabits: (token?: string) => request('/habits', { method: 'GET' }, token),

  createHabit: (habitData: Partial<Habit>, token?: string) =>
    request('/habits', {
      method: 'POST',
      body: JSON.stringify(habitData),
    }, token),

  toggleHabit: (habitId: string, token?: string) =>
    request(`/habits/${habitId}/toggle`, {
      method: 'PUT',
    }, token),

  deleteHabit: (habitId: string, token?: string) =>
    request(`/habits/${habitId}`, {
      method: 'DELETE',
    }, token),
};

// OpenRouter AI Endpoints (Powered by Llama 3.1 70B)
export const aiAPI = {
  chat: (message: string, token?: string) =>
    request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }, token),

  generateRoutine: (goal: string, token?: string) =>
    request('/ai/generate-routine', {
      method: 'POST',
      body: JSON.stringify({ goal }),
    }, token),
};

// Cloudinary Upload Endpoint
export const uploadAPI = {
  uploadAvatar: async (formData: FormData, token: string) => {
    const res = await fetch(`${API_BASE_URL}/upload/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    return await res.json();
  },
};
