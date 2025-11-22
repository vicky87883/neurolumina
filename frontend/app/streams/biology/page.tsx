'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import styles from '@/styles/StreamPage.module.css';

export default function BiologyPage() {
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
            <div className={styles.badge}>🧬 Biology</div>
            <h1 className={styles.heroTitle}>
              Discover <span className={styles.gradientText}>Life</span> Sciences
            </h1>
            <p className={styles.heroDescription}>
              Explore genetics, molecular biology, ecology, life sciences research, 
              and the wonders of biological systems.
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
                <h3 className={styles.paperTitle}>Genetics</h3>
                <div className={styles.paperLines}>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                </div>
              </div>
              <div className={styles.paperContent}>
                <p className={styles.paperText}>Genome sequencing and analysis</p>
                <p className={styles.paperText}>Gene expression and regulation</p>
                <p className={styles.paperText}>CRISPR and gene editing</p>
              </div>
            </div>
            <div className={`${styles.paper} ${styles.paper2}`}>
              <div className={styles.paperHeader}>
                <h3 className={styles.paperTitle}>Ecology</h3>
                <div className={styles.paperLines}>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                </div>
              </div>
              <div className={styles.paperContent}>
                <p className={styles.paperText}>Ecosystem dynamics</p>
                <p className={styles.paperText}>Biodiversity and conservation</p>
                <p className={styles.paperText}>Climate change impacts</p>
              </div>
            </div>
            <div className={`${styles.paper} ${styles.paper3}`}>
              <div className={styles.paperHeader}>
                <h3 className={styles.paperTitle}>Cell Biology</h3>
                <div className={styles.paperLines}>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                </div>
              </div>
              <div className={styles.paperContent}>
                <p className={styles.paperText}>Cellular processes and signaling</p>
                <p className={styles.paperText}>Organelles and structure</p>
                <p className={styles.paperText}>Cell division and growth</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.resourcesSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Biology Resources</h2>
          <div className={styles.resourcesGrid}>
            <div className={styles.resourceCard}>
              <h3>Research Papers</h3>
              <p>Access thousands of biology research papers</p>
            </div>
            <div className={styles.resourceCard}>
              <h3>Genome Database</h3>
              <p>Genomic sequences and annotations</p>
            </div>
            <div className={styles.resourceCard}>
              <h3>Lab Protocols</h3>
              <p>Experimental methods and procedures</p>
            </div>
            <div className={styles.resourceCard}>
              <h3>Visualizations</h3>
              <p>3D molecular and cellular structures</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

