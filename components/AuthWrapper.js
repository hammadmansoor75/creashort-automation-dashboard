'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function AuthWrapper({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = () => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const loginTime = localStorage.getItem('loginTime');
    
    if (authStatus === 'true' && loginTime) {
      // Check if login is still valid (24 hours)
      const loginDate = new Date(loginTime);
      const now = new Date();
      const hoursSinceLogin = (now - loginDate) / (1000 * 60 * 60);
      
      if (hoursSinceLogin < 24) {
        setIsAuthenticated(true);
      } else {
        // Session expired
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('username');
        localStorage.removeItem('loginTime');
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // Listen for storage changes (when user logs in from another tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'isAuthenticated') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Check auth when pathname changes (after login redirect)
  useEffect(() => {
    if (pathname !== '/login') {
      checkAuth();
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('loginTime');
    setIsAuthenticated(false);
    router.push('/login');
  };

  // If we're on the login page, don't show authentication wrapper
  if (pathname === '/login') {
    return children;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
