'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import styles from '@/styles/StreamPage.module.css';

export default function PhysicsPage() {
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

      {/* Navigation */}
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

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.badge}>⚛️ Physics</div>
            <h1 className={styles.heroTitle}>
              Explore the <span className={styles.gradientText}>Universe</span> of Physics
            </h1>
            <p className={styles.heroDescription}>
              Discover cutting-edge research papers, quantum mechanics, theoretical physics, 
              and groundbreaking discoveries from leading physicists worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Research Papers Animation */}
      <section className={styles.visualSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Featured Research Papers</h2>
          <div className={styles.papersContainer}>
            <div className={`${styles.paper} ${styles.paper1}`}>
              <div className={styles.paperHeader}>
                <h3 className={styles.paperTitle}>Quantum Entanglement</h3>
                <div className={styles.paperLines}>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                </div>
              </div>
              <div className={styles.paperContent}>
                <p className={styles.paperText}>Exploring non-local correlations in quantum systems</p>
                <p className={styles.paperText}>Bell inequality violations and quantum information</p>
                <p className={styles.paperText}>Applications in quantum computing</p>
              </div>
            </div>
            <div className={`${styles.paper} ${styles.paper2}`}>
              <div className={styles.paperHeader}>
                <h3 className={styles.paperTitle}>General Relativity</h3>
                <div className={styles.paperLines}>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                </div>
              </div>
              <div className={styles.paperContent}>
                <p className={styles.paperText}>Gravitational waves and black holes</p>
                <p className={styles.paperText}>Space-time curvature and cosmology</p>
                <p className={styles.paperText}>Dark matter and dark energy</p>
              </div>
            </div>
            <div className={`${styles.paper} ${styles.paper3}`}>
              <div className={styles.paperHeader}>
                <h3 className={styles.paperTitle}>Particle Physics</h3>
                <div className={styles.paperLines}>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                  <div className={styles.paperLine}></div>
                </div>
              </div>
              <div className={styles.paperContent}>
                <p className={styles.paperText}>Standard Model and beyond</p>
                <p className={styles.paperText}>Higgs boson and field theory</p>
                <p className={styles.paperText}>Supersymmetry and string theory</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Physics Animations */}
      <section className={styles.animationsSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Interactive Physics Concepts</h2>
          <div className={styles.animationsGrid}>
            <div className={styles.animationCard}>
              <div className={styles.animationIcon}>🌌</div>
              <h3>Wave-Particle Duality</h3>
              <div className={styles.waveAnimation}>
                <div className={styles.wave}></div>
                <div className={styles.particle}></div>
              </div>
            </div>
            <div className={styles.animationCard}>
              <div className={styles.animationIcon}>⚡</div>
              <h3>Electromagnetic Fields</h3>
              <div className={styles.fieldAnimation}>
                <div className={styles.fieldLine}></div>
                <div className={styles.fieldLine}></div>
                <div className={styles.fieldLine}></div>
              </div>
            </div>
            <div className={styles.animationCard}>
              <div className={styles.animationIcon}>🌀</div>
              <h3>Orbital Mechanics</h3>
              <div className={styles.orbitAnimation}>
                <div className={styles.planet}></div>
                <div className={styles.orbit}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className={styles.resourcesSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Physics Resources</h2>
          <div className={styles.resourcesGrid}>
            <div className={styles.resourceCard}>
              <h3>Research Papers</h3>
              <p>Access thousands of peer-reviewed physics papers</p>
            </div>
            <div className={styles.resourceCard}>
              <h3>Simulations</h3>
              <p>Interactive physics simulations and visualizations</p>
            </div>
            <div className={styles.resourceCard}>
              <h3>Study Materials</h3>
              <p>Textbooks, lecture notes, and study guides</p>
            </div>
            <div className={styles.resourceCard}>
              <h3>Community</h3>
              <p>Connect with physicists and researchers</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

