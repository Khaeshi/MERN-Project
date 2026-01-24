'use client';

import { useState, useEffect, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { getMe, logout as logoutUser, type User } from '../lib/auth';
import Image from 'next/image';

const navItems: string[] = ['Home', 'Shop', 'About', 'Contact'];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const pathname = usePathname();  
  const router = useRouter();

  // Determine current page including dashboard
  const currentPage: string = 
    pathname === '/shop' ? 'shop' : 
    pathname.startsWith('/admin/dashboard') ? 'dashboard' : 
    'home';

  // ✅ Memoized fetch function to prevent recreation on every render
  const fetchUser = useCallback(async () => {
    try {
      const userData = await getMe();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // ✅ Re-fetch when navigating to admin routes or after login redirect
  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/shop')) {
      fetchUser();
    }
  }, [pathname, fetchUser]);

  // ✅ Listen for custom event to refresh user (e.g., after login)
  useEffect(() => {
    const handleAuthChange = () => {
      fetchUser();
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [fetchUser]);

  const handleNavClick = (item: string): void => {
    if (item === 'Shop') {
      router.push('/shop');
    } else if (item === 'Dashboard') {
      router.push('/admin/dashboard');  
    } else {
      router.push('/');
      setTimeout(() => {
        const element = document.getElementById(item.toLowerCase());
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    setIsMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setIsMobileMenuOpen(false);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-black text-white py-4 px-6 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center">
            <Image
              src="/favicon.ico"
              alt="Cafe Prince Logo"
              width={48}
              height={48}
              className="w-full h-full object-contain"
            />
          </div>
          <div className="text-xl tracking-wider leading-tight">
            <div>CAFE</div>
            <div>PRINCE</div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {/* Show Dashboard for Admins */}
          {user?.role === 'admin' && (  
            <button
              onClick={() => handleNavClick('Dashboard')}
              className="relative text-white hover:text-gray-300 transition-colors tracking-wide group"
            >
              Dashboard
              <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-300 ease-out ${
                currentPage === 'dashboard' ? 'scale-x-100' : 'scale-x-0'
              }`} />
            </button>
          )}

          {navItems.map((item: string) => {
            const isActive = 
              (item === 'Shop' && currentPage === 'shop') ||
              (item === 'Home' && currentPage === 'home');
            
            return (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className="relative text-white hover:text-gray-300 transition-colors tracking-wide group"
              >
                {item}
                <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-white transform origin-left transition-transform duration-300 ease-out ${
                  isActive ? 'scale-x-100' : 'scale-x-0'
                }`} />
              </button>
            );
          })}

          {/* Login Button for Non-Logged-In Users */}
          {!isLoading && !user && (  
            <button
              onClick={() => router.push('/Authentication/login')}
              className="text-white hover:text-gray-300 transition-colors tracking-wide"
            >
              Login
            </button>
          )}

          {/* Logout Button for Logged-In Users */}
          {!isLoading && user && (
            <button
              onClick={handleLogout}
              className="text-white hover:text-gray-300 transition-colors tracking-wide"
            >
              Logout
            </button>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-gray-800 rounded transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <nav className="md:hidden text-white text-base">
          <div className="flex flex-col gap-4 pt-4">
            {/* Show Dashboard for Admins in Mobile */}
            {user?.role === 'admin' && (  
              <button
                onClick={() => handleNavClick('Dashboard')}
                className={`text-white hover:text-gray-300 transition-colors tracking-wide px-2 text-left ${
                  currentPage === 'dashboard' ? 'font-bold' : ''
                }`}
              >
                Dashboard
              </button>
            )}

            {navItems.map((item: string) => (
              <button
                key={item}
                onClick={() => handleNavClick(item)}
                className={`text-white hover:text-gray-300 transition-colors tracking-wide px-2 text-left ${
                  (item === 'Shop' && currentPage === 'shop') ||
                  (item === 'Home' && currentPage === 'home') ? 'font-bold' : ''
                }`}
              >
                {item}
              </button>
            ))}

            {/* Login in Mobile for Non-Logged-In Users */}
            {!isLoading && !user && (  
              <button
                onClick={() => { router.push('/Authentication/login'); setIsMobileMenuOpen(false); }}
                className="text-white hover:text-gray-300 transition-colors tracking-wide px-2 text-left"
              >
                Login
              </button>
            )}

            {/* Logout in Mobile for Logged-In Users */}
            {!isLoading && user && (
              <button
                onClick={handleLogout}
                className="text-white hover:text-gray-300 transition-colors tracking-wide px-2 text-left"
              >
                Logout
              </button>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}