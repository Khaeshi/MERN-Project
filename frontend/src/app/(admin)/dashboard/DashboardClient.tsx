'use client';

import { useState, useEffect } from 'react';  
import { useRouter } from 'next/navigation';  
import { API_ENDPOINTS } from '../../lib/api';
import useSWR from 'swr';
import { 
  Clock, 
  Package, 
  DollarSign, 
  TrendingUp,
  X,
  Loader2,
  Users,
  ShoppingBag
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

interface MenuItem { 
  id: string; 
  name: string; 
  price: number; 
  image: string; 
  description: string; 
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const fetcher = (url: string) => {
  const token = localStorage.getItem('adminToken');
  return fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  }).then(res => {
    if (!res.ok) throw new Error('Fetch failed');
    return res.json();
  });
};

export default function DashboardClient() { 
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  // Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch(API_ENDPOINTS.adminVerify, {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setUser({
            id: data.user._id || data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
          });
        } else {
          localStorage.removeItem('adminToken');
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        router.push('/login');
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUser();
  }, [router]);

  // Fetch menu items (for stats only - not displayed here)
  const { data: menuItems, error, mutate } = useSWR<MenuItem[]>(
    user ? API_ENDPOINTS.menu : null,
    fetcher
  );

  // Calculate stats
  const totalItems = menuItems?.length || 0;
  const totalValue = menuItems?.reduce((sum, item) => sum + item.price, 0) || 0;
  const avgPrice = totalItems > 0 ? totalValue / totalItems : 0;

  // Show loading while fetching user
  if (isLoadingUser || !user) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <Card className="p-8 text-center bg-stone-800 border-stone-700">
          <Loader2 className="w-12 h-12 mx-auto text-amber-500 mb-4 animate-spin" />
          <p className="text-stone-300">Loading...</p>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <Card className="p-8 text-center bg-stone-800 border-stone-700 max-w-md">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl mb-2 text-white font-bold">Error Loading Dashboard</h2>
          <p className="text-stone-400 mb-6">{error.message}</p>
          <Button 
            onClick={() => mutate()} 
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-stone-800 to-stone-900 border-b border-stone-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
              <p className="text-stone-400">Welcome back, {user.name}!</p>
              <p className="text-stone-500 text-sm mt-1">Overview of your cafe management</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Items */}
          <Card className="bg-gradient-to-br from-amber-900/20 to-stone-800 border-amber-700/50 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-sm font-medium mb-1">Total Menu Items</p>
                  {menuItems ? (
                    <>
                      <p className="text-3xl font-bold text-white">{totalItems}</p>
                      <p className="text-amber-400 text-xs mt-2">Active menu items</p>
                    </>
                  ) : (
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin mt-2" />
                  )}
                </div>
                <div className="w-12 h-12 bg-amber-600/20 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Value */}
          <Card className="bg-gradient-to-br from-green-900/20 to-stone-800 border-green-700/50 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-sm font-medium mb-1">Total Menu Value</p>
                  {menuItems ? (
                    <>
                      <p className="text-3xl font-bold text-white">₱{totalValue.toFixed(2)}</p>
                      <p className="text-green-400 text-xs mt-2">Combined menu value</p>
                    </>
                  ) : (
                    <Loader2 className="w-8 h-8 text-green-500 animate-spin mt-2" />
                  )}
                </div>
                <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Average Price */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-stone-800 border-blue-700/50 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-stone-400 text-sm font-medium mb-1">Average Price</p>
                  {menuItems ? (
                    <>
                      <p className="text-3xl font-bold text-white">₱{avgPrice.toFixed(2)}</p>
                      <p className="text-blue-400 text-xs mt-2">Per menu item</p>
                    </>
                  ) : (
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin mt-2" />
                  )}
                </div>
                <div className="w-12 h-12 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions or Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Actions Card */}
          <Card className="bg-stone-800 border-stone-700">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-500" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/menu')}
                  className="w-full bg-stone-700 hover:bg-amber-700 text-white justify-start"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Manage Menu Items
                </Button>
                <Button 
                  onClick={() => router.push('/orders')}
                  className="w-full bg-stone-700 hover:bg-amber-700 text-white justify-start"
                >
                  <Clock className="w-4 h-4 mr-2" />
                  View Orders
                </Button>
                <Button 
                  onClick={() => router.push('/users')}
                  className="w-full bg-stone-700 hover:bg-amber-700 text-white justify-start"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* User Info Card */}
          <Card className="bg-stone-800 border-stone-700">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-500" />
                Account Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-stone-500 text-sm">Name</p>
                  <p className="text-white font-medium">{user.name}</p>
                </div>
                <div>
                  <p className="text-stone-500 text-sm">Email</p>
                  <p className="text-white font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-stone-500 text-sm">Role</p>
                  <p className="text-white font-medium capitalize">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-600/20 text-amber-400 border border-amber-600/50">
                      {user.role}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}