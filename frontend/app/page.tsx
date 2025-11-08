'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect directly to dashboard without authentication check
    router.push('/dashboard');
  }, [router]);

  return null;
}

