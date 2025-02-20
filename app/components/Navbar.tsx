"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link href="/" className="flex items-center">
              Home
            </Link>
            <Link href="/events" className="flex items-center">
              Events
            </Link>
            {/* Only show Approve Events link for admin users */}
            {user?.role === 'ADMIN' && (
              <Link href="/events/approve" className="flex items-center">
                Approve Events
              </Link>
            )}
          </div>
          {/* Rest of your navbar items */}
        </div>
      </div>
    </nav>
  );
} 