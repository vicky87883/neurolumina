'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import styles from '@/styles/StreamPage.module.css';

export default function EngineeringPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={styles.container}>
      <div 
        className={styles.animatedBackground}
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(120, 119, 198, 0.3), transparent 40%)`
        }}
      />

      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoText}>IntelliThesis</span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>Home</Link>
            <Link href="/#streams" className={styles.navLink}>Streams</Link>
            <ThemeToggle />
            <Link href="/login" className={styles.navButton}>Sign In</Link>
          </div>
        </div>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>⚙️ Engineering</div>
            <h1 className={styles.heroTitle}>
              Build the <span className={styles.gradientText}>Future</span>
            </h1>
            <p className={styles.heroDescription}>
              Explore mechanical, electrical, civil, aerospace engineering, 
              and innovative engineering solutions.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.visualSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Featured Research Papers</h2>
          <div className={styles.papersContainer}>
            <div className={`${styles.paper} ${styles.paper1}`}>
              <div className={styles.paperHeader}>
                <h3 className={styles.paperTitle}>Mechanical Engineering</h3>
                <div className={styles.paperLines}>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                </div>
              </div>
              <div className={styles.paperContent}>
                <p className={styles.paperText}>Thermodynamics and heat transfer</p>
                <p className={styles.paperText}>Materials and manufacturing</p>
                <p className={styles.paperText}>Robotics and automation</p>
              </div>
            </div>
            <div className={`${styles.paper} ${styles.paper2}`}>
              <div className={styles.paperHeader}>
                <h3 className={styles.paperTitle}>Electrical Engineering</h3>
                <div className={styles.paperLines}>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                </div>
              </div>
              <div className={styles.paperContent}>
                <p className={styles.paperText}>Circuit design and analysis</p>
                <p className={styles.paperText}>Power systems and electronics</p>
                <p className={styles.paperText}>Signal processing</p>
              </div>
            </div>
            <div className={`${styles.paper} ${styles.paper3}`}>
              <div className={styles.paperHeader}>
                <h3 className={styles.paperTitle}>Civil Engineering</h3>
                <div className={styles.paperLines}>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                </div>
              </div>
              <div className={styles.paperContent}>
                <p className={styles.paperText}>Structural analysis and design</p>
                <p className={styles.paperText}>Infrastructure development</p>
                <p className={styles.paperText}>Sustainable construction</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.resourcesSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Engineering Resources</h2>
          <div className={styles.resourcesGrid}>
            <div className={styles.resourceCard}>
              <h3>Research Papers</h3>
              <p>Access thousands of engineering research papers</p>
            </div>
            <div className={styles.resourceCard}>
              <h3>Design Tools</h3>
              <p>CAD software and design resources</p>
            </div>
            <div className={styles.resourceCard}>
              <h3>Standards & Codes</h3>
              <p>Engineering standards and building codes</p>
            </div>
            <div className={styles.resourceCard}>
              <h3>Case Studies</h3>
              <p>Real-world engineering projects and solutions</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

