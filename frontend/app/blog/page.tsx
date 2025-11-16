'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getBlogs, Blog } from '@/lib/api';
import { isAuthenticated } from '@/lib/auth';
import ThemeToggle from '@/components/ThemeToggle';
import styles from '@/styles/Blog.module.css';

export default function BlogPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        // Fetch published blogs (authentication optional for public blogs)
        const data = await getBlogs(0, 20, true);
        setBlogs(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>
            <svg className={styles.logoSvg} viewBox="0 0 40 40" fill="none">
              <defs>
                <linearGradient id="blogLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="18" fill="url(#blogLogoGradient)" opacity="0.2" />
              <path 
                d="M20 8 L20 32 M8 20 L32 20 M14 14 L26 26 M26 14 L14 26" 
                stroke="url(#blogLogoGradient)" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
              <circle cx="20" cy="20" r="3" fill="url(#blogLogoGradient)" />
            </svg>
            <span className={styles.logoText}>IntelliThesis</span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>Home</Link>
            <Link href="/blog" className={`${styles.navLink} ${styles.active}`}>Blog</Link>
            <Link href="/careers" className={styles.navLink}>Careers</Link>
            <ThemeToggle />
            {isAuthenticated() ? (
              <Link href="/dashboard" className={styles.navButton}>
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className={styles.navButton}>Sign In</Link>
                <Link href="/signup" className={styles.navButtonPrimary}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Blog</h1>
          <p className={styles.description}>
            Insights, updates, and research from the IntelliThesis team
          </p>
        </div>

        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading blogs...</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            {!isAuthenticated() && (
              <Link href="/login" className={styles.errorLink}>
                Sign in to view blogs
              </Link>
            )}
          </div>
        )}

        {!loading && !error && blogs.length === 0 && (
          <div className={styles.empty}>
            <h2>No blogs yet</h2>
            <p>Check back soon for updates and insights!</p>
          </div>
        )}

        {!loading && !error && blogs.length > 0 && (
          <div className={styles.blogGrid}>
            {blogs.map((blog) => (
              <Link 
                key={blog.id} 
                href={`/blog/${blog.id}`}
                className={styles.blogCard}
              >
                <div className={styles.blogHeader}>
                  <h2 className={styles.blogTitle}>{blog.title}</h2>
                  {blog.category && (
                    <span className={styles.blogCategory}>{blog.category}</span>
                  )}
                </div>
                {blog.excerpt && (
                  <p className={styles.blogExcerpt}>{blog.excerpt}</p>
                )}
                <div className={styles.blogFooter}>
                  <div className={styles.blogAuthor}>
                    <span>{blog.author_username || blog.author_email}</span>
                  </div>
                  <div className={styles.blogDate}>
                    {formatDate(blog.created_at)}
                  </div>
                </div>
                {blog.tags && blog.tags.length > 0 && (
                  <div className={styles.blogTags}>
                    {blog.tags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className={styles.blogTag}>{tag}</span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}






