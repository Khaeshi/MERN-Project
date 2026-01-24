import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export const metadata: Metadata = {
  title: "Admin Dashboard - Cafe Prince",
  description: "Manage menu items and admin functions for Cafe Prince.",
};

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

async function getAuthenticatedUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    console.log('🔍 Dashboard: Checking auth...');
    console.log('Token exists:', !!token);

    if (!token) {
      console.log('❌ No token found');
      return null;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    console.log('API URL:', apiUrl);

    // ✅ FIX: Use Authorization header instead of Cookie header
    const res = await fetch(`${apiUrl}/api/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`, // ✅ Changed from Cookie to Authorization
      },
      cache: 'no-store',
    });

    console.log('Response status:', res.status);

    if (!res.ok) {
      console.log('❌ Auth check failed');
      const errorData = await res.json();
      console.log('Error response:', errorData);
      return null;
    }

    const data = await res.json();
    console.log('✅ User data:', data.user);
    return data.user;
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return null;
  }
}

export default async function AdminDashboardPage() {
  // ✅ Fetch user (all try-catch is inside the helper function)
  const user = await getAuthenticatedUser();

  // ✅ Redirect if not authenticated or not admin
  // These redirects are NOT inside try-catch, so they work properly
  if (!user) {
    redirect('/Authentication/login');
  }

  if (user.role !== 'admin') {
    redirect('/'); // Redirect non-admins to home
  }

  // ✅ Render dashboard for admin users
  return <DashboardClient user={user} />;
}