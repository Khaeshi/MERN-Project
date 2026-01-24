// lib/auth.ts - Authentication utilities for Next.js App Router

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

// ✅ Client-side: Login function
export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important: Send cookies
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
}

// ✅ Client-side: Register function
export async function register(name: string, email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Important: Send cookies
    body: JSON.stringify({ name, email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Registration failed');
  }

  return data;
}

// ✅ Client-side: Logout function
export async function logout() {
  const res = await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include', // Important: Send cookies
  });

  if (!res.ok) {
    throw new Error('Logout failed');
  }

  return res.json();
}

// ✅ Client-side: Get current user (use in Client Components)
export async function getMe(): Promise<User | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      credentials: 'include', // Important: Send cookies
      cache: 'no-store',
    });

    if (!res.ok) {
      // ✅ 401 is expected when user is not logged in - don't log as error
      if (res.status === 401) {
        return null;
      }
      // Log other errors
      console.error('Get me error: Unexpected status', res.status);
      return null;
    }

    const data = await res.json();
    return data.user;
  } catch (error) {
    // ✅ Only log actual network/parse errors
    console.error('Get me error:', error);
    return null;
  }
}