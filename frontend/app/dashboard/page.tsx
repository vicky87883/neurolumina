'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUserData, validateToken } from '@/lib/auth';
import Dashboard from '@/components/Dashboard';
import styles from '@/styles/DashboardPage.module.css';

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication and validate token
    if (!isAuthenticated() || !validateToken()) {
      router.push('/login');
      return;
    }

    // Get user data
    const userData = getUserData();
    if (userData) {
      setUser(userData);
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null;
  }

  return <Dashboard />;
}

