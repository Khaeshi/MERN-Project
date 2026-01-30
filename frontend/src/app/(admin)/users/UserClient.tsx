'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { API_ENDPOINTS } from '../../lib/api';
import { 
  Users as UsersIcon,
  Search,
  Loader2,
  X,
  Shield,
  User,
  Mail,
  Calendar,
  Trash2,
  UserCog,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import Image from 'next/image';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer' | 'user';
  authProvider: 'local' | 'google';
  profilePicture?: string;
  googleId?: string;
  createdAt: string;
  updatedAt: string;
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

export default function UsersClient() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'customer' | 'user'>('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch users
  const { data: users, error, mutate } = useSWR<User[]>(
    `${API_ENDPOINTS.users}`,
    fetcher
  );

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Treat 'user' and 'customer' as the same category
    const matchesRole = filterRole === 'all' || 
                        user.role === filterRole || 
                        (filterRole === 'customer' && user.role === 'user');
    
    return matchesSearch && matchesRole;
  });

  // Calculate stats
  const totalUsers = users?.length || 0;
  const adminCount = users?.filter(u => u.role === 'admin').length || 0;
  const customerCount = users?.filter(u => u.role === 'customer' || u.role === 'user').length || 0;
  const googleUsers = users?.filter(u => u.authProvider === 'google').length || 0;

  // Update user role
  const updateUserRole = async (userId: string, newRole: 'admin' | 'customer' | 'user') => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_ENDPOINTS.users}/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error('Failed to update user');

      mutate();
      setShowEditModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  // Delete user
  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_ENDPOINTS.users}/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      if (!res.ok) throw new Error('Failed to delete user');
      mutate();
    } catch (error) {
      alert('Failed to delete user. Please contact admin.');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Error state
  if (error) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
        <Card className="p-8 text-center bg-stone-800 border-stone-700 max-w-md">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl mb-2 text-white font-bold">Error Loading Users</h2>
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
      <div>
        <h1 className="text-3xl font-bold text-white">User Management</h1>
        <p className="text-stone-400 mt-1">Manage user accounts and permissions</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-900/20 to-stone-800 border-blue-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-400 text-xs font-medium mb-1">Total Users</p>
                <p className="text-2xl font-bold text-white">{totalUsers}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-stone-800 border-purple-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-400 text-xs font-medium mb-1">Admins</p>
                <p className="text-2xl font-bold text-white">{adminCount}</p>
              </div>
              <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-900/20 to-stone-800 border-green-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-400 text-xs font-medium mb-1">Customers</p>
                <p className="text-2xl font-bold text-white">{customerCount}</p>
              </div>
              <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-900/20 to-stone-800 border-amber-700/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-stone-400 text-xs font-medium mb-1">OAuth Users</p>
                <p className="text-2xl font-bold text-white">{googleUsers}</p>
              </div>
              <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-500 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-stone-800 border-stone-700 text-white placeholder-stone-500 focus:border-amber-600"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={filterRole === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterRole('all')}
            className={filterRole === 'all' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'}
          >
            All
          </Button>
          <Button
            variant={filterRole === 'admin' ? 'default' : 'outline'}
            onClick={() => setFilterRole('admin')}
            className={filterRole === 'admin' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'}
          >
            Admins
          </Button>
          <Button
            variant={filterRole === 'customer' ? 'default' : 'outline'}
            onClick={() => setFilterRole('customer')}
            className={filterRole === 'customer' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'}
          >
            Customers
          </Button>
        </div>
      </div>

      {/* Users List */}
      {!users ? (
        <Card className="p-12 text-center bg-stone-800 border-stone-700">
          <Loader2 className="w-12 h-12 mx-auto text-amber-500 mb-4 animate-spin" />
          <p className="text-stone-300">Loading users...</p>
        </Card>
      ) : filteredUsers && filteredUsers.length === 0 ? (
        <Card className="p-12 text-center bg-stone-800 border-stone-700">
          <UsersIcon className="w-16 h-16 mx-auto text-stone-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-white">No users found</h3>
          <p className="text-stone-400">
            {searchQuery 
              ? `No users match "${searchQuery}"`
              : 'No users in this category'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredUsers?.map((user, index) => (
            <Card key={`${user.id}-${index}`} className="bg-stone-800 border-stone-700 hover:border-stone-600 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  {/* User Info */}
                  <div className="flex items-start gap-4 flex-1">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-stone-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {user.profilePicture ? (
                        <Image
                          src={user.profilePicture}
                          alt={user.name}
                          width={48}
                          height={48}
                          className="object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-stone-400" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {user.name}
                        </h3>
                        {user.role === 'admin' && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-purple-600/20 text-purple-300 rounded-full flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Admin
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-sm text-stone-400 mb-2">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {user.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Joined {formatDate(user.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {user.authProvider === 'google' ? (
                          <span className="px-2 py-1 text-xs bg-blue-600/20 text-blue-300 rounded flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Google OAuth
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs bg-stone-700 text-stone-300 rounded flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            Local Auth
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingUser(user);
                        setShowEditModal(true);
                      }}
                      className="bg-stone-700 border-stone-600 text-white hover:bg-stone-600"
                    >
                      <UserCog className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteUser(user.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/50 border-stone-600 hover:border-red-600"
                      disabled={user.role === 'admin'} // Prevent deleting admins
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit User Role Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-stone-800 border-stone-700 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <UserCog className="w-5 h-5 text-amber-500" />
                  Edit User Role
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="text-stone-400 hover:text-white hover:bg-stone-700"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-stone-400 mb-1">User</p>
                  <p className="text-white font-medium">{editingUser.name}</p>
                  <p className="text-sm text-stone-500">{editingUser.email}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-stone-300">Select Role</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateUserRole(editingUser.id, 'customer')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        editingUser.role === 'customer'
                          ? 'border-amber-600 bg-amber-600/10'
                          : 'border-stone-700 hover:border-stone-600'
                      }`}
                    >
                      <User className="w-6 h-6 mx-auto mb-2 text-green-400" />
                      <p className="text-sm font-medium text-white">Customer</p>
                      <p className="text-xs text-stone-400 mt-1">Regular user access</p>
                    </button>

                    <button
                      onClick={() => updateUserRole(editingUser.id, 'admin')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        editingUser.role === 'admin'
                          ? 'border-amber-600 bg-amber-600/10'
                          : 'border-stone-700 hover:border-stone-600'
                      }`}
                    >
                      <Shield className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                      <p className="text-sm font-medium text-white">Admin</p>
                      <p className="text-xs text-stone-400 mt-1">Full access</p>
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-700">
                  <p className="text-xs text-stone-500">
                    {editingUser.authProvider === 'google' 
                      ? '⚠️ This user signed up with Google OAuth'
                      : 'This user uses traditional email/password authentication'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}