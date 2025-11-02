'use client';

import { useState, useEffect } from 'react';
import styles from './SideNav.module.css';

interface SideNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function SideNav({ activeSection, onSectionChange }: SideNavProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const menuItems = [
    { id: 'chat', label: 'Neural Chat', icon: '💬' },
    { id: 'training', label: 'Training Hub', icon: '🧠' },
    { id: 'scraping', label: 'Web Scraper', icon: '🕷️' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'dataset', label: 'Dataset', icon: '📁' },
    { id: 'models', label: 'Models', icon: '🔮' },
  ];

  return (
    <nav className={`${styles.sideNav} ${isCollapsed ? styles.collapsed : ''} ${mounted ? styles.mounted : ''}`}>
      <div className={styles.navHeader}>
        <div className={styles.logo}>
          {!isCollapsed && (
            <>
              <div className={styles.logoIcon}>🧠</div>
              <div className={styles.logoText}>
                <div className={styles.logoTitle}>NeuroLumina</div>
                <div className={styles.logoSubtitle}>AI Platform</div>
              </div>
            </>
          )}
          {isCollapsed && <div className={styles.logoIconOnly}>🧠</div>}
        </div>
        <button
          className={styles.collapseButton}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? 'Expand menu' : 'Collapse menu'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      <ul className={styles.menuList}>
        {menuItems.map((item) => (
          <li key={item.id}>
            <button
              className={`${styles.menuItem} ${
                activeSection === item.id ? styles.active : ''
              }`}
              onClick={() => onSectionChange(item.id)}
            >
              <span className={styles.menuIcon}>{item.icon}</span>
              {!isCollapsed && <span className={styles.menuLabel}>{item.label}</span>}
            </button>
          </li>
        ))}
      </ul>

      <div className={styles.navFooter}>
        {!isCollapsed && (
          <div className={styles.version}>v1.0.0 • Neural Net</div>
        )}
      </div>
    </nav>
  );
}

