'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getUserData, logout } from '@/lib/auth';
import styles from './SideNav.module.css';

interface SideNavProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export default function SideNav({ activeSection, onSectionChange }: SideNavProps) {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const userData = getUserData();
    if (userData) {
      setUser(userData);
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const menuItems = [
    { id: 'chat', label: 'Neural Chat', icon: '💬' },
    { id: 'training', label: 'Training Hub', icon: '🧠' },
    { id: 'scraping', label: 'Web Scraper', icon: '🕷️' },
    { id: 'plagiarism', label: 'Plagiarism Detection', icon: '🔍' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'dataset', label: 'Dataset', icon: '📁' },
    { id: 'models', label: 'Models', icon: '🔮' },
  ];

  const handleNavClick = (path: string) => {
    router.push(path);
  };

  return (
    <nav className={`${styles.sideNav} ${isCollapsed ? styles.collapsed : ''} ${mounted ? styles.mounted : ''}`}>
      <div className={styles.navHeader}>
        <div className={styles.logo}>
          {!isCollapsed && (
            <>
              <div className={styles.logoIcon}>🧠</div>
              <div className={styles.logoText}>
                <div className={styles.logoTitle}>IntelliThesis</div>
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
        <li>
          <button
            className={styles.menuItem}
            onClick={() => handleNavClick('/blog')}
          >
            <span className={styles.menuIcon}>📝</span>
            {!isCollapsed && <span className={styles.menuLabel}>Blog</span>}
          </button>
        </li>
        <li>
          <button
            className={styles.menuItem}
            onClick={() => handleNavClick('/careers')}
          >
            <span className={styles.menuIcon}>💼</span>
            {!isCollapsed && <span className={styles.menuLabel}>Careers</span>}
          </button>
        </li>
      </ul>

      <div className={styles.navFooter}>
        {!isCollapsed && user && (
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.username || user.email}</div>
            <div className={styles.userEmail}>{user.email}</div>
          </div>
        )}
        <button 
          className={styles.logoutButton}
          onClick={handleLogout}
          title="Logout"
        >
          {!isCollapsed ? '🚪 Logout' : '🚪'}
        </button>
        {!isCollapsed && (
          <div className={styles.version}>v1.0.0 • IntelliThesis</div>
        )}
      </div>
    </nav>
  );
}

