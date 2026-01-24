'use client';

import { useState } from 'react';
import { register as registerUser } from '../../lib/auth'; // ✅ Import from lib/auth

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // ✅ Use the register function from lib/auth
      const data = await registerUser(name, email, password);
      console.log('✅ Registration successful:', data.user);
      // Optionally redirect to login or show success message
      alert('Registration successful! Please log in.');
      // router.push('/login'); // Uncomment if you have useRouter imported
    } catch (err) {
      setError((err as Error).message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-900">
      <div className="w-full max-w-md bg-stone-800 rounded-lg shadow-md p-8 border-stone-700">
        <h2 className="text-2xl font-bold text-center text-white mb-6">Register</h2>

        {error && (
          <div className="bg-red-900/20 border border-red-700 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-stone-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-stone-600 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 bg-stone-700 text-white placeholder-stone-500"
              required
            />
          </div>

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
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-sm text-stone-400">Already have an account? </span>
          <a href="/login" className="text-sm text-amber-400 hover:underline">
            Login here
          </a>
        </div>
      </div>
    </div>
  );
}