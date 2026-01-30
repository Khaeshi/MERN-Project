'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { API_ENDPOINTS } from '../../lib/api';
import { 
  Plus, 
  Package, 
  DollarSign, 
  Image as ImageIcon, 
  FileText, 
  Trash2, 
  Edit,
  X,
  Search,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import Image from 'next/image';
import ImageGallery from '../../components/admin/ImageGallery';

interface MenuItem { 
  _id: string;
  id: string; 
  name: string; 
  price: number; 
  image: string; 
  description: string; 
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

export default function MenuClient() {
  const [newItem, setNewItem] = useState({ name: '', price: 0, image: '', description: '' });
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [imageGalleryMode, setImageGalleryMode] = useState<'add' | 'edit'>('add');

  // Fetch menu items
  const { data: menuItems, error, mutate } = useSWR<MenuItem[]>(
    API_ENDPOINTS.menu,
    fetcher
  );

  // Filter menu items based on search
  const filteredItems = menuItems?.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Add item
  const addItem = async () => {
    setIsSubmitting(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(API_ENDPOINTS.menu, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newItem),
      });

      if (!res.ok) throw new Error('Failed to add item');

      mutate(); 
      setNewItem({ name: '', price: 0, image: '', description: '' });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update item
  const updateItem = async () => {
    if (!editingItem) return;
    
    setIsSubmitting(true);
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_ENDPOINTS.menu}/${editingItem._id || editingItem.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingItem.name,
          price: editingItem.price,
          image: editingItem.image,
          description: editingItem.description,
        }),
      });

      if (!res.ok) throw new Error('Failed to update item');

      mutate();
      setShowEditModal(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete item
  const deleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this menu item?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_ENDPOINTS.menu}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Failed to delete item');
      mutate();
    } catch (error) {
      alert('Failed to delete item. Please contact admin.');
    }
  };

  // Open edit modal
  const handleEdit = (item: MenuItem) => {
    setEditingItem({ ...item });
    setShowEditModal(true);
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
        <Card className="p-8 text-center bg-stone-800 border-stone-700 max-w-md">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl mb-2 text-white font-bold">Error Loading Menu</h2>
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Menu Management</h1>
          <p className="text-stone-400 mt-1">Manage your cafe menu items</p>
        </div>
        <Button 
          onClick={() => setShowAddModal(true)}
          className="bg-amber-600 hover:bg-amber-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500 w-5 h-5" />
        <Input
          type="text"
          placeholder="Search menu items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-stone-800 border-stone-700 text-white placeholder-stone-500 focus:border-amber-600"
        />
      </div>

      {/* Menu Items Grid */}
      {!menuItems ? (
        <Card className="p-12 text-center bg-stone-800 border-stone-700">
          <Loader2 className="w-12 h-12 mx-auto text-amber-500 mb-4 animate-spin" />
          <p className="text-stone-300">Loading menu items...</p>
        </Card>
      ) : filteredItems && filteredItems.length === 0 ? (
        <Card className="p-12 text-center bg-stone-800 border-stone-700">
          <Package className="w-16 h-16 mx-auto text-stone-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-white">
            {searchQuery ? 'No items found' : 'No menu items yet'}
          </h3>
          <p className="text-stone-400 mb-6">
            {searchQuery 
              ? `No items match "${searchQuery}"`
              : 'Add your first menu item to get started'}
          </p>
          {!searchQuery && (
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems?.map((item) => (
            <Card 
              key={item._id || item.id} 
              className="overflow-hidden hover:shadow-xl transition-all duration-300 bg-stone-800 border-stone-700 hover:border-amber-600/50"
            >
              <div className="aspect-video w-full bg-stone-700 relative overflow-hidden group">
                {item.image && item.image.trim() !== '' ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-stone-500" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    ₱{item.price.toFixed(2)}
                  </span>
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">
                  {item.name}
                </h3>
                <p className="text-stone-400 text-sm mb-4 line-clamp-2 min-h-[40px]">
                  {item.description}
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(item)}
                    className="flex-1 bg-stone-700 border-stone-600 text-white hover:bg-stone-600 hover:border-amber-600"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/50 border-stone-600 hover:border-red-600"
                    onClick={() => deleteItem(item._id || item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg bg-stone-800 border-stone-700 shadow-2xl">
            <CardHeader className="border-b border-stone-700">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-white text-xl">
                    <Plus className="w-5 h-5 text-amber-500" />
                    Add New Menu Item
                  </CardTitle>
                  <CardDescription className="text-stone-400 mt-1">
                    Fill in the details to create a new menu item
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewItem({ name: '', price: 0, image: '', description: '' });
                  }}
                  className="text-stone-400 hover:text-white hover:bg-stone-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label htmlFor="modal-name" className="flex items-center gap-2 text-stone-300">
                  <Package className="w-4 h-4" />
                  Item Name *
                </Label>
                <Input
                  id="modal-name"
                  placeholder="e.g., Caramel Macchiato"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="bg-stone-700 border-stone-600 text-white placeholder-stone-500 focus:border-amber-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modal-price" className="flex items-center gap-2 text-stone-300">
                  <DollarSign className="w-4 h-4" />
                  Price (₱) *
                </Label>
                <Input
                  id="modal-price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={newItem.price || ''}
                  onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                  className="bg-stone-700 border-stone-600 text-white placeholder-stone-500 focus:border-amber-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modal-image" className="flex items-center gap-2 text-stone-300">
                  <ImageIcon className="w-4 h-4" />
                  Image
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="modal-image"
                    placeholder="Image URL from S3"
                    value={newItem.image}
                    onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                    className="flex-1 bg-stone-700 border-stone-600 text-white placeholder-stone-500 focus:border-amber-600"
                    readOnly
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setImageGalleryMode('add');
                      setShowImageGallery(true);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Browse
                  </Button>
                </div>
                {newItem.image && (
                  <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden bg-stone-700">
                    <Image
                      src={newItem.image}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="modal-description" className="flex items-center gap-2 text-stone-300">
                  <FileText className="w-4 h-4" />
                  Description
                </Label>
                <Textarea
                  id="modal-description"
                  placeholder="Describe your menu item..."
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  rows={4}
                  className="bg-stone-700 border-stone-600 text-white placeholder-stone-500 focus:border-amber-600 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowAddModal(false);
                    setNewItem({ name: '', price: 0, image: '', description: '' });
                  }}
                  className="flex-1 bg-stone-700 border-stone-600 text-white hover:bg-stone-600"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={addItem} 
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={!newItem.name || !newItem.price || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Item
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Item Modal */}
      {showEditModal && editingItem && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg bg-stone-800 border-stone-700 shadow-2xl">
            <CardHeader className="border-b border-stone-700">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-white text-xl">
                    <Edit className="w-5 h-5 text-amber-500" />
                    Edit Menu Item
                  </CardTitle>
                  <CardDescription className="text-stone-400 mt-1">
                    Update the details of your menu item
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="text-stone-400 hover:text-white hover:bg-stone-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-stone-300">
                  <Package className="w-4 h-4" />
                  Item Name *
                </Label>
                <Input
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  className="bg-stone-700 border-stone-600 text-white placeholder-stone-500 focus:border-amber-600"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-stone-300">
                  <DollarSign className="w-4 h-4" />
                  Price (₱) *
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  value={editingItem.price}
                  onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                  className="bg-stone-700 border-stone-600 text-white placeholder-stone-500 focus:border-amber-600"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-stone-300">
                  <ImageIcon className="w-4 h-4" />
                  Image
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={editingItem.image}
                    onChange={(e) => setEditingItem({ ...editingItem, image: e.target.value })}
                    className="flex-1 bg-stone-700 border-stone-600 text-white placeholder-stone-500 focus:border-amber-600"
                    placeholder="Image URL from S3"
                    readOnly
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setImageGalleryMode('edit');
                      setShowImageGallery(true);
                    }}
                    className="bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Browse
                  </Button>
                </div>
                {editingItem.image && (
                  <div className="mt-2 relative w-full h-32 rounded-lg overflow-hidden bg-stone-700">
                    <Image
                      src={editingItem.image}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-stone-300">
                  <FileText className="w-4 h-4" />
                  Description
                </Label>
                <Textarea
                  value={editingItem.description}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  rows={4}
                  className="bg-stone-700 border-stone-600 text-white placeholder-stone-500 focus:border-amber-600 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingItem(null);
                  }}
                  className="flex-1 bg-stone-700 border-stone-600 text-white hover:bg-stone-600"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={updateItem} 
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                  disabled={!editingItem.name || !editingItem.price || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-2" />
                      Update Item
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Image Gallery Modal - Placed outside other modals */}
      {showImageGallery && (
        <ImageGallery
          onSelectImage={(url) => {
            if (imageGalleryMode === 'add') {
              setNewItem({ ...newItem, image: url });
            } else if (editingItem) {
              setEditingItem({ ...editingItem, image: url });
            }
          }}
          selectedImage={imageGalleryMode === 'add' ? newItem.image : editingItem?.image}
          onClose={() => setShowImageGallery(false)}
        />
      )}
    </div>
  );
}