'use client';  // Mark as client component

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Plus, Package, DollarSign, Image as ImageIcon, FileText, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';  // Adjusted path (assuming app/components/ui)
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import Image from 'next/image';

interface MenuItem { 
  id: string; 
  name: string; 
  price: number; 
  image: string; 
  description: string; 
}

// Define a proper interface for the User object
interface User {
  name?: string;
  role?: string;
  // Add other properties here if your user object has more (e.g., email, id)
}

// Fetcher function - now gets token dynamically (safe for client-side)
const fetcher = (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;  // Check if window exists
  return fetch(url, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  }).then(res => res.json());
};

export default function DashboardClient() {
  const router = useRouter();
  const [newItem, setNewItem] = useState({ name: '', price: 0, image: '', description: '' });
  // Initialize user state lazily from localStorage to avoid setState in useEffect
  const [user] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}') as User;
      return storedUser;
    }
    return null;
  });


  const { data: menuItems, mutate } = useSWR<MenuItem[]>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/menu`,
    fetcher
  );


  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/login');
    }
  }, [user, router]);

  const addItem = async () => {
    const token = localStorage.getItem('token');  
    await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/menu`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify(newItem),
    });
    mutate(); 
    setNewItem({ name: '', price: 0, image: '', description: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your menu items</p>
            </div>
            {/* Welcome Message for Logged-in Users */}
            {user && user.name && (
              <div className="text-right">
                <p className="text-lg font-medium text-gray-800">
                  Welcome {user.role === 'admin' ? 'Admin' : user.name}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Item Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Add Menu Item
                </CardTitle>
                <CardDescription>
                  Create a new item for your menu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={newItem.price || ''}
                    onChange={(e) => setNewItem({ ...newItem, price: +e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Image URL
                  </Label>
                  <Input
                    id="image"
                    placeholder="https://example.com/image.jpg"
                    value={newItem.image}
                    onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Enter item description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={addItem} 
                  className="w-full"
                  disabled={!newItem.name || !newItem.price}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Menu Items List */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-2xl mb-2">Menu Items</h2>
              <p className="text-gray-600">
                {menuItems?.length || 0} items in your menu
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {menuItems?.map((item, index) => (
                <Card key={item.id || `item-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                    {item.image ? (
                      <Image
                        src={item.image} 
                        alt={item.name}
                        width={50}
                        height={50}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <span className="text-lg font-semibold text-green-600">
                        ₱{item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {menuItems?.length === 0 && (
              <Card className="p-12 text-center">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl mb-2">No menu items yet</h3>
                <p className="text-gray-600">
                  Add your first menu item to get started
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}