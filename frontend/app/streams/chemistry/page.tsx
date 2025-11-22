'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import styles from '@/styles/StreamPage.module.css';

export default function ChemistryPage() {
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
            <div className={styles.badge}>🧪 Chemistry</div>
            <h1 className={styles.heroTitle}>
              Explore <span className={styles.gradientText}>Molecular</span> Worlds
            </h1>
            <p className={styles.heroDescription}>
              Discover organic synthesis, molecular structures, chemical reactions, 
              and groundbreaking research in chemistry.
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
                <h3 className={styles.paperTitle}>Organic Synthesis</h3>
                <div className={styles.paperLines}>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                </div>
              </div>
              <div className={styles.paperContent}>
                <p className={styles.paperText}>Advanced synthetic methodologies</p>
                <p className={styles.paperText}>Catalysis and reaction mechanisms</p>
                <p className={styles.paperText}>Green chemistry principles</p>
              </div>
            </div>
            <div className={`${styles.paper} ${styles.paper2}`}>
              <div className={styles.paperHeader}>
                <h3 className={styles.paperTitle}>Molecular Biology</h3>
                <div className={styles.paperLines}>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                </div>
              </div>
              <div className={styles.paperContent}>
                <p className={styles.paperText}>Protein structures and functions</p>
                <p className={styles.paperText}>Enzyme kinetics and mechanisms</p>
                <p className={styles.paperText}>Biochemical pathways</p>
              </div>
            </div>
            <div className={`${styles.paper} ${styles.paper3}`}>
              <div className={styles.paperHeader}>
                <h3 className={styles.paperTitle}>Materials Chemistry</h3>
                <div className={styles.paperLines}>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                </div>
              </div>
              <div className={styles.paperContent}>
                <p className={styles.paperText}>Nanomaterials and applications</p>
                <p className={styles.paperText}>Polymers and composites</p>
                <p className={styles.paperText}>Smart materials design</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.resourcesSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Chemistry Resources</h2>
          <div className={styles.resourcesGrid}>
            <div className={styles.resourceCard}>
              <h3>Research Papers</h3>
              <p>Access thousands of chemistry research papers</p>
            </div>
            <div className={styles.resourceCard}>
              <h3>Molecular Models</h3>
              <p>3D molecular structures and visualizations</p>
            </div>
            <div className={styles.resourceCard}>
              <h3>Reaction Database</h3>
              <p>Comprehensive chemical reaction database</p>
            </div>
            <div className={styles.resourceCard}>
              <h3>Lab Techniques</h3>
              <p>Experimental methods and protocols</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

