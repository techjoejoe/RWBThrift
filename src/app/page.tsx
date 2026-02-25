'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (user?.role === 'dm') {
      router.replace('/dm-dashboard');
    } else {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  return null;
}
