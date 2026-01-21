'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Image from 'next/image';

const navItems: string[] = ['Home', 'Shop', 'About', 'Contact'];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const pathname = usePathname();  
  const router = useRouter();
  const { user, logout } = useAuth();

  const currentPage: string = pathname === '/shop' ? 'shop' : 'home';


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
              className="text-white hover:text-gray-300 transition-colors tracking-wide"
            >
              Dashboard
            </button>
          )}

          {navItems.map((item: string) => (
            <button
              key={item}
              onClick={() => handleNavClick(item)}
              className={`text-white hover:text-gray-300 transition-colors tracking-wide ${
                (item === 'Shop' && currentPage === 'shop') ||
                (item === 'Home' && currentPage === 'home') ? 'border-b-2 border-white' : ''
              }`}
            >
              {item}
            </button>
          ))}

          {/* Login Button for Non-Logged-In Users */}
          {!user && (  
            <button
              onClick={() => router.push('/Authentication/login')}
              className="text-white hover:text-gray-300 transition-colors tracking-wide"
            >
              Login
            </button>
          )}

          {/* Logout Button for Logged-In Users */}
          {user && (
            <button
              onClick={logout}
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
                className="text-white hover:text-gray-300 transition-colors tracking-wide px-2 text-left"
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
            {!user && (  
              <button
                onClick={() => { router.push('/Authentication/login'); setIsMobileMenuOpen(false); }}
                className="text-white hover:text-gray-300 transition-colors tracking-wide px-2 text-left"
              >
                Login
              </button>
            )}

            {/* Logout in Mobile for Logged-In Users */}
            {user && (
              <button
                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
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