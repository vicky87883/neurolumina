'use client';

import styles from '@/styles/UniversityLogo.module.css';

interface UniversityLogoProps {
  name: string;
  className?: string;
}

export default function UniversityLogo({ name, className = '' }: UniversityLogoProps) {
  const renderLogo = () => {
    switch (name) {
      case 'MIT':
        return (
          <div className={styles.logoContent} style={{ color: '#A31F34' }}>
            <div className={styles.logoShape} style={{ backgroundColor: '#A31F34' }}></div>
            <span className={styles.logoText}>MIT</span>
          </div>
        );
      case 'Cambridge':
        return (
          <div className={styles.logoContent} style={{ color: '#A51C30' }}>
            <div className={styles.logoCircle} style={{ backgroundColor: '#A51C30' }}></div>
            <span className={styles.logoText}>CAMBRIDGE</span>
          </div>
        );
      case 'Stanford':
        return (
          <div className={styles.logoContent} style={{ color: '#8C1515' }}>
            <div className={styles.logoShape} style={{ backgroundColor: '#8C1515' }}></div>
            <span className={styles.logoText}>STANFORD</span>
          </div>
        );
      case 'Harvard':
        return (
          <div className={styles.logoContent} style={{ color: '#A51E2D' }}>
            <div className={styles.logoShape} style={{ backgroundColor: '#A51E2D' }}></div>
            <span className={styles.logoText}>HARVARD</span>
          </div>
        );
      case 'Oxford':
        return (
          <div className={styles.logoContent} style={{ color: '#002147' }}>
            <div className={styles.logoCircle} style={{ backgroundColor: '#002147' }}></div>
            <span className={styles.logoText}>OXFORD</span>
          </div>
        );
      case 'ETH Zurich':
        return (
          <div className={styles.logoContent} style={{ color: '#006699' }}>
            <div className={styles.logoShape} style={{ backgroundColor: '#006699' }}></div>
            <span className={styles.logoText}>ETH</span>
          </div>
        );
      case 'Caltech':
        return (
          <div className={styles.logoContent} style={{ color: '#FF6C0C' }}>
            <div className={styles.logoShape} style={{ backgroundColor: '#FF6C0C' }}></div>
            <span className={styles.logoText}>CALTECH</span>
          </div>
        );
      case 'Princeton':
        return (
          <div className={styles.logoContent} style={{ color: '#FF8F00' }}>
            <div className={styles.logoCircle} style={{ backgroundColor: '#FF8F00' }}></div>
            <span className={styles.logoText}>PRINCETON</span>
          </div>
        );
      default:
        return (
          <div className={styles.logoContent}>
            <span className={styles.logoText}>{name}</span>
          </div>
        );
    }
  };

  return (
    <div className={`${styles.logoContainer} ${className}`}>
      {renderLogo()}
    </div>
  );
}
