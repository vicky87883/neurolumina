'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import styles from '@/styles/StreamPage.module.css';

export default function MathematicsPage() {
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
            <div className={styles.badge}>📐 Mathematics</div>
            <h1 className={styles.heroTitle}>
              Unlock the <span className={styles.gradientText}>Language</span> of Numbers
            </h1>
            <p className={styles.heroDescription}>
              Explore pure mathematics, proofs, equations, mathematical research, 
              and the beauty of abstract thinking.
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
                <h3 className={styles.paperTitle}>Number Theory</h3>
                <div className={styles.paperLines}>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                </div>
              </div>
              <div className={styles.paperContent}>
                <p className={styles.paperText}>Prime numbers and factorization</p>
                <p className={styles.paperText}>Modular arithmetic and cryptography</p>
                <p className={styles.paperText}>Diophantine equations</p>
              </div>
            </div>
            <div className={`${styles.paper} ${styles.paper2}`}>
              <div className={styles.paperHeader}>
                <h3 className={styles.paperTitle}>Topology</h3>
                <div className={styles.paperLines}>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                </div>
              </div>
              <div className={styles.paperContent}>
                <p className={styles.paperText}>Manifolds and surfaces</p>
                <p className={styles.paperText}>Algebraic topology</p>
                <p className={styles.paperText}>Differential geometry</p>
              </div>
            </div>
            <div className={`${styles.paper} ${styles.paper3}`}>
              <div className={styles.paperHeader}>
                <h3 className={styles.paperTitle}>Analysis</h3>
                <div className={styles.paperLines}>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                </div>
              </div>
              <div className={styles.paperContent}>
                <p className={styles.paperText}>Real and complex analysis</p>
                <p className={styles.paperText}>Functional analysis</p>
                <p className={styles.paperText}>Harmonic analysis</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.resourcesSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Mathematics Resources</h2>
          <div className={styles.resourcesGrid}>
            <div className={styles.resourceCard}>
              <h3>Proofs & Theorems</h3>
              <p>Mathematical proofs and theorem database</p>
            </div>
            <div className={styles.resourceCard}>
              <h3>Visualizations</h3>
              <p>Interactive mathematical visualizations</p>
            </div>
            <div className={styles.resourceCard}>
              <h3>Problem Sets</h3>
              <p>Challenging problems and solutions</p>
            </div>
            <div className={styles.resourceCard}>
              <h3>Research Papers</h3>
              <p>Latest mathematics research publications</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

