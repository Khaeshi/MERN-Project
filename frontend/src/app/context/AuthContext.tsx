'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import axios, { AxiosError } from 'axios';

// API Base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);  // ✅ Fixed syntax

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize state from cookies/localStorage
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    
    const token = Cookies.get('token');
    if (token) {
      const storedUser = localStorage.getItem('user');
      console.log('AuthContext: Loading user from localStorage:', storedUser);  // ✅ Added log
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return Cookies.get('token') || null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Set axios default authorization header on mount
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Verify token on mount (optional but recommended) - ✅ Commented out to avoid clearing user if endpoint missing
  // useEffect(() => {
  //   const verifyToken = async () => {
  //     if (!token) return;
  //     try {
  //       const response = await axios.get(`${API_URL}/api/auth/me`);
  //       setUser(response.data.user);
  //     } catch (err) {
  //       console.error('Token verification failed:', err);
  //       logout();
  //     }
  //   };
  //   verifyToken();
  // }, []); // Only run on mount

  const login = async (email: string, password: string): Promise<void> => {
    // Validate inputs BEFORE making request
    if (!email || !password) {
      setError('Please provide email and password');
      throw new Error('Please provide email and password');
    }

    if (typeof email !== 'string' || typeof password !== 'string') {
      setError('Invalid input format');
      throw new Error('Invalid input format');
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔐 Attempting login to:', `${API_URL}/api/auth/login`);

      // Make login request to Express backend
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      console.log('✅ Login response:', response.data);  // ✅ Added log

      const { token: authToken, user: userData } = response.data;

      console.log('AuthContext: Extracted userData:', userData);  // ✅ Added log

      if (!authToken || !userData) {
        throw new Error('Invalid response from server');
      }

      // Save to cookies and localStorage
      Cookies.set('token', authToken, { expires: 7 });
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setToken(authToken);
      setUser(userData);
      console.log('AuthContext: User state set to:', userData);  // ✅ Added log
      setError(null);

      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

      console.log('✅ Login successful!');

      // Redirect based on role
      setTimeout(() => {
        if (userData.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/shop';
        }
      }, 100);

    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      console.error('❌ Login error:', axiosErr);
      
      const errorMessage = axiosErr.response?.data?.message || axiosErr.message || 'Login failed';
      setError(errorMessage);
      
      alert(errorMessage);
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string): Promise<void> => {
    // ✅ Validate inputs
    if (!name || !email || !password) {
      setError('Please provide name, email, and password');
      throw new Error('Please provide name, email, and password');
    }

    try {
      setIsLoading(true);
      setError(null);

      console.log('🔐 Attempting registration for:', email);

      // ✅ Call register API
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        name,
        email,
        password
      });

      console.log('✅ Registration response:', response.data);

      // After successful registration, optionally auto-login or redirect
      alert('Registration successful! Please log in.');
      window.location.href = '/login';  // Redirect to login page

    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>;
      console.error('❌ Registration error:', axiosErr);
      const errorMessage = axiosErr.response?.data?.message || axiosErr.message || 'Registration failed';
      setError(errorMessage);
      alert(errorMessage);
      throw axiosErr;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    // Clear cookies and localStorage
    Cookies.remove('token');
    localStorage.removeItem('user');
    
    // Clear state
    setUser(null);
    setToken(null);
    setError(null);
    
    // Remove axios authorization header
    delete axios.defaults.headers.common['Authorization'];
    
    // Redirect to home
    window.location.href = '/';
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};