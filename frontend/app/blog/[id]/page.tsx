'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getBlog, Blog } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';
import styles from '@/styles/BlogDetail.module.css';

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        if (!params || !params.id) {
          throw new Error('Invalid blog ID');
        }
        const blogId = parseInt(params.id as string);
        if (isNaN(blogId)) {
          throw new Error('Invalid blog ID');
        }
        const data = await getBlog(blogId);
        setBlog(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load blog');
      } finally {
        setLoading(false);
      }
    };

    if (params && params.id) {
      fetchBlog();
    }
  }, [params]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className={styles.container}>
        <nav className={styles.navbar}>
          <div className={styles.navContainer}>
            <Link href="/" className={styles.logo}>
              <svg className={styles.logoSvg} viewBox="0 0 40 40" fill="none">
                <defs>
                  <linearGradient id="blogDetailLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <circle cx="20" cy="20" r="18" fill="url(#blogDetailLogoGradient)" opacity="0.2" />
                <path 
                  d="M20 8 L20 32 M8 20 L32 20 M14 14 L26 26 M26 14 L14 26" 
                  stroke="url(#blogDetailLogoGradient)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />
                <circle cx="20" cy="20" r="3" fill="url(#blogDetailLogoGradient)" />
              </svg>
              <span className={styles.logoText}>IntelliThesis</span>
            </Link>
            <div className={styles.navLinks}>
              <Link href="/" className={styles.navLink}>Home</Link>
              <Link href="/blog" className={styles.navLink}>Blog</Link>
              <Link href="/careers" className={styles.navLink}>Careers</Link>
              <ThemeToggle />
              {isAuthenticated() ? (
                <Link href="/dashboard" className={styles.navButton}>Dashboard</Link>
              ) : (
                <>
                  <Link href="/login" className={styles.navButton}>Sign In</Link>
                  <Link href="/signup" className={styles.navButtonPrimary}>Get Started</Link>
                </>
              )}
            </div>
          </div>
        </nav>
        <div className={styles.error}>
          <h2>Blog Not Found</h2>
          <p>{error || 'The blog you are looking for does not exist.'}</p>
          <Link href="/blog" className={styles.backButton}>← Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>
            <svg className={styles.logoSvg} viewBox="0 0 40 40" fill="none">
              <defs>
                <linearGradient id="blogDetailLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="18" fill="url(#blogDetailLogoGradient)" opacity="0.2" />
              <path 
                d="M20 8 L20 32 M8 20 L32 20 M14 14 L26 26 M26 14 L14 26" 
                stroke="url(#blogDetailLogoGradient)" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
              <circle cx="20" cy="20" r="3" fill="url(#blogDetailLogoGradient)" />
            </svg>
            <span className={styles.logoText}>IntelliThesis</span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>Home</Link>
            <Link href="/blog" className={styles.navLink}>Blog</Link>
            <Link href="/careers" className={styles.navLink}>Careers</Link>
            {isAuthenticated() ? (
              <Link href="/dashboard" className={styles.navButton}>Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className={styles.navButton}>Sign In</Link>
                <Link href="/signup" className={styles.navButtonPrimary}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <article className={styles.article}>
        <div className={styles.articleHeader}>
          <Link href="/blog" className={styles.backLink}>← Back to Blog</Link>
          {blog.category && (
            <span className={styles.category}>{blog.category}</span>
          )}
          <h1 className={styles.title}>{blog.title}</h1>
          <div className={styles.meta}>
            <div className={styles.author}>
              <span>By {blog.author_username || blog.author_email}</span>
            </div>
            <div className={styles.date}>
              {formatDate(blog.created_at)}
            </div>
          </div>
          {blog.tags && blog.tags.length > 0 && (
            <div className={styles.tags}>
              {blog.tags.map((tag, idx) => (
                <span key={idx} className={styles.tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div className={styles.content}>
          <div 
            className={styles.blogContent}
            dangerouslySetInnerHTML={{ __html: blog.content.replace(/\n/g, '<br />') }}
          />
        </div>
      </article>
    </div>
  );
}

