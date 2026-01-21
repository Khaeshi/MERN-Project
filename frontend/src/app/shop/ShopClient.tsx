'use client'

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import useSWR from 'swr';
import Image from 'next/image';
import { ShoppingCart, Star, Search, Filter, Plus, Check } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { CartSidebar } from '../components/Cart/CartSidebar';  
import { CartModal } from '../components/Cart/CartModal';  


interface ApiMenuItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}


interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error('Failed to fetch menu items');
  return res.json();
});

export default function ShopClient() {
  const { addToCart, getTotalItems, toggleCart } = useCart();  
  const [searchQuery, setSearchQuery] = useState('');
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  

  const { data: apiData, error, isLoading } = useSWR<ApiMenuItem[]>(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/menu`, 
    fetcher
  );


  const menuItems: MenuItem[] = apiData ? apiData.map((item: ApiMenuItem) => ({
    id: item._id,
    name: item.name,
    price: item.price,
    image: item.image,
    description: item.description,
  })) : [];


  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item);
    setAddedItems(prev => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }, 2000);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading delicious menu...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-center py-20">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <p className="text-red-600 font-semibold">Error: {error.message}</p>
              <p className="text-red-500 text-sm mt-2">Please try again later</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl mb-2">Our Menu</h1>
              <p className="text-gray-600">Discover our delicious selection</p>
            </div>
            
            {/* Buy Button */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Button variant="outline" size="lg" onClick={toggleCart} className="relative">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Buy
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center p-0">
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="sm:w-auto">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-white rounded-lg shadow-sm p-12 max-w-md mx-auto">
              <Search className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl mb-2">No items found</h3>
              <p className="text-gray-600">Try adjusting your search query</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6 text-sm text-gray-600">
              Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item: MenuItem) => {
                const isAdded = addedItems.has(item.id);
                
                return (
                  <Card
                    key={item.id}
                    className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-gray-200 bg-white"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={50}
                        height={50}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Floating Badge */}
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-white text-gray-900 font-semibold px-3 py-1">
                          ₱{item.price}
                        </Badge>
                      </div>

                      {/* Rating */}
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-semibold">4.5</span>
                      </div>
                    </div>

                    <CardContent className="p-5">
                      <h3 className="text-xl font-semibold mb-2 text-gray-900 group-hover:text-gray-700 transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500">Price</span>
                          <span className="text-2xl font-bold text-gray-900">
                            ₱{item.price}
                          </span>
                        </div>
                        
                        <Button
                          onClick={() => handleAddToCart(item)}
                          size="lg"
                          className={`transition-all duration-300 ${
                            isAdded 
                              ? 'bg-green-600 hover:bg-green-700' 
                              : 'bg-gray-900 hover:bg-gray-800'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-4 h-4 mr-2" />
                              Added
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Add
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
      <CartSidebar />
      <CartModal />
    </div>
  );
}