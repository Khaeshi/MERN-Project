'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login as loginUser } from '../../lib/auth'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Sending login request:', { email, password });

    try {
      // ✅ Use the login function from @/lib/auth
      const data = await loginUser(email, password);
      
      console.log('✅ Login successful:', data.user);

      // Redirect based on role (Header will auto-refresh when pathname changes)
      if (data.user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/shop');
      }
      router.refresh(); // Refresh server components to update auth state
    } catch (err) {
      setError((err as Error).message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900">
      <div className="w-full max-w-md bg-stone-800 rounded-lg shadow-md p-8 border-stone-700">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Login</h2>
        
        {error && (
          <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-stone-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-stone-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-700 text-white placeholder-stone-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-stone-300 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-stone-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-700 text-white placeholder-stone-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/forgot-password" className="text-sm text-amber-400 hover:underline">
            Forgot your password?
          </a>
        </div>

        <div className="mt-4 text-center">
          <span className="text-sm text-stone-400">Don&#39;t have an account? </span>
          <a href="/register" className="text-sm text-amber-400 hover:underline">
            Register here
          </a>
        </div>
      </div>
    </div>
  );
}