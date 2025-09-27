'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Clock,
  Settings,
  Menu,
  X,
  LogOut,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Agents', href: '/agents', icon: Users },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
  { name: 'Processing', href: '/processing', icon: Clock },
];

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('loginTime');
    router.push('/login');
  };

  // Update UTC time every second

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Mobile sidebar */}
      <div className={cn(
        "fixed inset-0 z-50 lg:hidden",
        sidebarOpen ? "block" : "hidden"
      )}>
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-gray-900 shadow-2xl">
          <div className="flex h-20 items-center justify-between px-2 border-b border-gray-700">
            <div className="flex-1 px-2">
              <Image
                src="/logo-text.png"
                alt="CreaShort Logo"
                width={240}
                height={64}
                className="w-full h-auto"
              />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white transition-colors ml-2 cursor-pointer"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-3 text-sm font-medium transition-all duration-200 relative",
                    isActive
                      ? "text-white border-l-4 border-amber-500 bg-gray-800/50"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gray-900 shadow-2xl">
          <div className="flex h-20 items-center px-2 border-b border-gray-700">
            <div className="w-full px-2">
              <Image
                src="/logo-text.png"
                alt="CreaShort Logo"
                width={240}
                height={64}
                className="w-full h-auto"
              />
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-3 text-sm font-medium transition-all duration-200 relative",
                    isActive
                      ? "text-white border-l-4 border-amber-500 bg-gray-800/50"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                      isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-300 hover:bg-red-600 hover:text-white rounded-lg transition-all duration-200 hover:scale-105 cursor-pointer"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 bg-white shadow-lg lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden hover:text-gray-700 transition-colors cursor-pointer"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 items-center justify-center px-4">
            <Image
              src="/logo-text.png"
              alt="CreaShort Logo"
              width={100}
              height={28}
              className="h-7 w-auto"
            />
          </div>
        </div>

        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
