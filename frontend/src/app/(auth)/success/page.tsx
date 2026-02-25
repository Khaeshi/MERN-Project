'use client'

import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AuthSuccessPage() {
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      
      if (token) {
        await fetch(`${API_URL}/api/auth/set-cookie`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ token }),
        });

        await checkAuth();
      }

      const redirectTo = localStorage.getItem('redirectAfterLogin') || '/';
      localStorage.removeItem('redirectAfterLogin');
      window.location.href = redirectTo;
    };

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
        <h2 className="text-2xl font-bold text-white mb-2">Login successful! ✨</h2>
        <p className="text-stone-400">Taking you back...</p>
      </div>
    </div>
  );
}