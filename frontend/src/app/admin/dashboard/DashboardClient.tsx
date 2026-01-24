'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { Plus, Package, DollarSign, Image as ImageIcon, FileText, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Props {
  user: User; 
}

// Fetcher function - use credentials: 'include' to send httpOnly cookies
const fetcher = (url: string) => {
  return fetch(url, {
    credentials: 'include', 
  }).then(res => {
    if (!res.ok) throw new Error('Fetch failed');
    return res.json();
  });
};

export default function DashboardClient({ user }: Props) {
  const [newItem, setNewItem] = useState({ name: '', price: 0, image: '', description: '' });

  // Fetch menu items
  const { data: menuItems, error, mutate } = useSWR<MenuItem[]>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/menu`,
    fetcher
  );

  // add items
  const addItem = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/menu`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify(newItem),
      });

      if (!res.ok) {
        throw new Error('Failed to add item');
      }

      mutate(); // Refresh the menu items
      setNewItem({ name: '', price: 0, image: '', description: '' });
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    }
  };

  // delete items
  const deleteItem = async (id: string) => {
    if (!confirm('You want to delete this menu item?'))
      return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/menu/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) {
        throw new Error('Failed to delete item');
      }

      mutate();
    } catch (error) {
      alert('Failed to delete item. Contact Admin.');
    }
  };

  // If there's an error loading menu items
  if (error) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <Card className="p-8 text-center bg-stone-800 border-stone-700">
          <h2 className="text-2xl mb-4 text-white">Error Loading Menu</h2>
          <p className="text-stone-300 mb-4">{error.message}</p>
          <Button onClick={() => mutate} className="bg-amber-600 hover:bg-amber-700 text-white">Retry</Button>
        </Card>
      </div>
    );
  }

  // Render the full dashboard
  return (
    <div className="min-h-screen bg-stone-900">
      {/* Header */}
      <div className="bg-stone-800 border-b border-stone-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-stone-300 mt-1">Manage your menu items</p>
            </div>
            {/* Welcome Message */}
            <div className="text-right">
              <p className="text-sm text-stone-400">Welcome back,</p>
              <p className="font-semibold text-white">{user.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Item Form */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 bg-stone-800 border-stone-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Plus className="w-5 h-5" />
                  Add Menu Item
                </CardTitle>
                <CardDescription className="text-stone-400">
                  Create a new item for your menu
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-stone-300">
                    <Package className="w-4 h-4" />
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Enter item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="bg-stone-700 border-stone-600 text-white placeholder-stone-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-2 text-stone-300">
                    <DollarSign className="w-4 h-4" />
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="0.00"
                    value={newItem.price || ''}
                    onChange={(e) => setNewItem({ ...newItem, price: +e.target.value })}
                    className="bg-stone-700 border-stone-600 text-white placeholder-stone-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="flex items-center gap-2 text-stone-300">
                    <ImageIcon className="w-4 h-4" />
                    Image URL
                  </Label>
                  <Input
                    id="image"
                    placeholder="/products/coffee.jpg"
                    value={newItem.image}
                    onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                    className="bg-stone-700 border-stone-600 text-white placeholder-stone-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="flex items-center gap-2 text-stone-300">
                    <FileText className="w-4 h-4" />
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Enter item description"
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    rows={3}
                    className="bg-stone-700 border-stone-600 text-white placeholder-stone-500"
                  />
                </div>

                <Button 
                  onClick={addItem} 
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
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
              <h2 className="text-2xl font-bold mb-2 text-white">Menu Items</h2>
              <p className="text-stone-300">
                {menuItems?.length || 0} items in your menu
              </p>
            </div>

            {!menuItems ? (
              <Card className="p-12 text-center bg-stone-800 border-stone-700">
                <p className="text-stone-300">Loading menu items...</p>
              </Card>
            ) : menuItems.length === 0 ? (
              <Card className="p-12 text-center bg-stone-800 border-stone-700">
                <Package className="w-16 h-16 mx-auto text-stone-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">No menu items yet</h3>
                <p className="text-stone-300">
                  Add your first menu item to get started
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems.map((item, index) => (
                  <Card key={item.id || `item-${index}`} className="overflow-hidden hover:shadow-lg transition-shadow bg-stone-800 border-stone-700">
                    <div className="aspect-video w-full bg-stone-700 relative overflow-hidden">
                      {item.image && item.image.trim() !== '' && item.image.startsWith('/products/') ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-stone-500" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg text-white">{item.name}</h3>
                        <span className="text-lg font-semibold text-amber-400">
                          ₱{item.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-stone-300 text-sm mb-4 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 bg-stone-700 border-stone-600 text-white hover:bg-stone-600">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-400 hover:text-red-300 hover:bg-red-900 border-stone-600"
                          onClick={() => deleteItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}