import { apiFetch } from '@/utils/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://airswift-backend-fjt3.onrender.com";

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export const registerUser = async (formData: RegisterFormData) => {
  try {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const loginUser = async (formData: LoginFormData) => {
  try {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(formData),
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const verifyOTP = async (email: string, otp: string) => {
  try {
    const data = await apiFetch('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const forgotPassword = async (email: string) => {
  try {
    const data = await apiFetch('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (token: string, password: string) => {
  try {
    const data = await apiFetch(`/api/auth/reset-password/${token}`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to refresh token');
    }

    return data;
  } catch (error) {
    throw error;
  }
};
