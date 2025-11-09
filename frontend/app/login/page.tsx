'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import { setAuthToken, setUserData, isAuthenticated, validateToken } from '@/lib/auth';
import UniversityLogo from '@/components/UniversityLogo';
import styles from '@/styles/Auth.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Redirect to dashboard if already authenticated and token is valid
    if (isAuthenticated() && validateToken()) {
      router.push('/dashboard');
    }
  }, [router]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ email, password });
      setAuthToken(response.access_token);
      setUserData(response.user);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      {/* Animated background gradient */}
      <div 
        className={styles.animatedBackground}
        style={{
          background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(99, 102, 241, 0.15), transparent 40%)`
        }}
      />

      {/* Trusted by section */}
      <div className={styles.trustedBy}>
        <p className={styles.trustedByText}>Trusted by researchers at</p>
        <div className={styles.universityLogos}>
          <div className={styles.logoItem}>
            <UniversityLogo name="MIT" />
          </div>
          <div className={styles.logoItem}>
            <UniversityLogo name="Cambridge" />
          </div>
          <div className={styles.logoItem}>
            <UniversityLogo name="Stanford" />
          </div>
          <div className={styles.logoItem}>
            <UniversityLogo name="Harvard" />
          </div>
          <div className={styles.logoItem}>
            <UniversityLogo name="Oxford" />
          </div>
          <div className={styles.logoItem}>
            <UniversityLogo name="ETH Zurich" />
          </div>
        </div>
      </div>

      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <Link href="/" className={styles.logo}>
            <svg className={styles.logoSvg} viewBox="0 0 40 40" fill="none">
              <defs>
                <linearGradient id="authLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="18" fill="url(#authLogoGradient)" opacity="0.2" />
              <path 
                d="M20 8 L20 32 M8 20 L32 20 M14 14 L26 26 M26 14 L14 26" 
                stroke="url(#authLogoGradient)" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
              <circle cx="20" cy="20" r="3" fill="url(#authLogoGradient)" />
            </svg>
            <span className={styles.logoText}>IntelliThesis</span>
          </Link>
          <h1>Welcome Back</h1>
          <p>Sign in to continue your research</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {error && (
            <div className={styles.errorMessage}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
                <path d="M10 6v4M10 14h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2.5 6.66667L9.0755 11.0504C9.63533 11.4236 10.3647 11.4236 10.9245 11.0504L17.5 6.66667M4.16667 15H15.8333C16.7538 15 17.5 14.2538 17.5 13.3333V6.66667C17.5 5.74619 16.7538 5 15.8333 5H4.16667C3.24619 5 2.5 5.74619 2.5 6.66667V13.3333C2.5 14.2538 3.24619 15 4.16667 15Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                autoComplete="email"
                disabled={loading}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M15.8333 9.16667H4.16667C3.24619 9.16667 2.5 9.91286 2.5 10.8333V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V10.8333C17.5 9.91286 16.7538 9.16667 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.83333 9.16667V5.83333C5.83333 4.72826 6.27232 3.66846 7.05372 2.88706C7.83512 2.10565 8.89493 1.66667 9.99999 1.66667C11.1051 1.66667 12.1649 2.10565 12.9463 2.88706C13.7277 3.66846 14.1667 4.72826 14.1667 5.83333V9.16667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                className={styles.input}
              />
            </div>
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? (
              <>
                <svg className={styles.spinner} width="20" height="20" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="50" strokeDashoffset="25" opacity="0.3"/>
                  <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="50" strokeDashoffset="25">
                    <animate attributeName="stroke-dashoffset" values="25;-25" dur="1s" repeatCount="indefinite"/>
                  </circle>
                </svg>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </>
            )}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>
            Don't have an account?{' '}
            <Link href="/signup" className={styles.link}>
              Sign up
            </Link>
          </p>
          <p>
            <Link href="/" className={styles.link}>
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
