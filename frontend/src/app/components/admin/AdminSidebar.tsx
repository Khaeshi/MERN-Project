'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Menu', href: '/menu', icon: '🍽️' },
  { name: 'Orders', href: '/orders', icon: '📦' },
  { name: 'Users', href: '/users', icon: '👥', adminOnly: true },
];

interface AdminSidebarProps {
  role?: string;
}

export default function AdminSidebar({ role }: AdminSidebarProps) {
  const pathname = usePathname();

  const visibleNavItems = navItems.filter(item =>
    !item.adminOnly || role === 'admin'
  );

  return (
    <aside className="w-64 bg-white shadow-md min-h-[calc(100vh-73px)]">
      <nav className="p-4">
        <ul className="space-y-2">
          {visibleNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}