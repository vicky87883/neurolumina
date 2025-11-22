'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/styles/Admin.module.css';

// Use HTTPS in production, HTTP for local development
const getApiUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.protocol === 'https:') {
      return process.env.NEXT_PUBLIC_API_URL || 'https://api.intellithesis.com';
    }
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

const API_BASE_URL = getApiUrl();

interface AdminCredentials {
  username: string;
  email: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState<AdminCredentials | null>(null);

  useEffect(() => {
    // Fetch default admin credentials
    fetch(`${API_BASE_URL}/api/admin/credentials`)
      .then(res => res.json())
      .then(data => setCredentials(data))
      .catch(() => {});
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Invalid credentials');
      }

      const data = await response.json();
      
      // Store admin token
      localStorage.setItem('admin_token', data.access_token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      
      // Redirect to admin dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginCard}>
        <div className={styles.logoSection}>
          <svg className={styles.logoSvg} viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="adminLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <circle cx="20" cy="20" r="18" fill="url(#adminLogoGradient)" opacity="0.2" />
            <path 
              d="M20 8 L20 32 M8 20 L32 20 M14 14 L26 26 M26 14 L14 26" 
              stroke="url(#adminLogoGradient)" 
              strokeWidth="2.5" 
              strokeLinecap="round"
            />
            <circle cx="20" cy="20" r="3" fill="url(#adminLogoGradient)" />
          </svg>
          <h1 className={styles.title}>Admin Login</h1>
          <p className={styles.subtitle}>IntelliThesis Administration</p>
        </div>

        {credentials && (
          <div className={styles.credentialsInfo}>
            <p className={styles.credentialsLabel}>Default Credentials:</p>
            <p className={styles.credentialsText}>
              <strong>Username:</strong> {credentials.username}
            </p>
            <p className={styles.credentialsText}>
              <strong>Email:</strong> {credentials.email}
            </p>
            <p className={styles.credentialsNote}>
              Password: Admin@123 (Change in production)
            </p>
          </div>
        )}

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={styles.input}
              placeholder="Enter username"
              required
              autoFocus
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Enter password"
              required
            />
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

