'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();
  const redirected = useRef(false);

  useEffect(() => {
    if (loading || redirected.current) return;
    redirected.current = true;
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (user?.role === 'dm') {
      router.replace('/dm-dashboard');
    } else {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, user?.role, router, loading]);

  return null;
}
