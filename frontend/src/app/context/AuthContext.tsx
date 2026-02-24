'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  authProvider: 'local' | 'google';
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  showLoginModal: boolean;
  setShowLoginModal: (show: boolean) => void;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isCheckingAuth = useRef(false); // ✅ Prevent concurrent checkAuth calls

  const checkAuth = async () => {
    // ✅ Prevent multiple simultaneous calls
    if (isCheckingAuth.current) {
      console.log('⏭️ CheckAuth already in progress, skipping...');
      return;
    }

    isCheckingAuth.current = true;
    console.log('🔍 Checking auth...');

    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        credentials: 'include',
      });

      console.log('Auth response status:', response.status);

      const data = await response.json();
      console.log('Auth data:', data);

      if (data.success && data.user) {
        console.log('✅ User authenticated:', data.user.email);
        setUser(data.user);
        setShowLoginModal(false);
      } else {
        console.log('❌ No user found');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
      isCheckingAuth.current = false; // ✅ Reset flag
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out...');
      
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
  
      const data = await response.json();
      console.log('Logout response:', data);
  
      // Clear user state immediately
      setUser(null);
      
      // Clear stored data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('redirectAfterLogin');
      }
      
      // Show login modal only on non-admin pages
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin')) {
        setShowLoginModal(true);
      }
      
      console.log('✅ Logout complete');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      // Still clear user even if API fails
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []); // ✅ Empty deps - only run once on mount

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        showLoginModal,
        setShowLoginModal,
        checkAuth,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
