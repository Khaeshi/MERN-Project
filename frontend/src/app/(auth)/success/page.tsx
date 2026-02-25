'use client'

import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'

export default function AuthSuccessPage() {
  const {checkAuth} = useAuth();

  useEffect(() => {
    console.log('✅ Auth success page loaded');


    const handleAuth = async () => {
      await checkAuth();

      const redirectTo = localStorage.getItem('redirectAfterLogin') || '/';
      localStorage.removeItem('redirectAfterLogin');
      console.log('🚀 Redirecting to:', redirectTo);
      window.location.href = redirectTo;
    };

    handleAuth();
  }, []); 

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900">
      <div className="text-center">
        {/* Spinning loader */}
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4"></div>
        
        {/* Success message */}
        <h2 className="text-2xl font-bold text-white mb-2">
          Login successful! ✨
        </h2>
        
        {/* Subtext */}
        <p className="text-stone-400">
          Taking you back...
        </p>
      </div>
    </div>
  );
}