'use client';

import { useState, useEffect } from 'react';
import SideNav from './SideNav';
import ChatWindow from './ChatWindow';
import TrainingStatus from './TrainingStatus';
import WebScraper from './WebScraper';
import PlagiarismDetector from './PlagiarismDetector';
import AnimatedBackground from './AnimatedBackground';
import FloatingParticles from './FloatingParticles';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('chat');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, [activeSection]);

  const renderContent = () => {
    switch (activeSection) {
      case 'chat':
        return (
          <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <h2>Neural Chat Interface</h2>
              <p>Interact with NeuroLumina AI using advanced neural networks</p>
            </div>
            <ChatWindow />
          </div>
        );
      case 'training':
        return (
          <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <h2>Training Hub</h2>
              <p>Monitor and control reinforcement learning training sessions</p>
            </div>
            <TrainingStatus />
          </div>
        );
      case 'scraping':
        return (
          <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <h2>Web Scraper</h2>
              <p>Extract content from websites and save to PostgreSQL database</p>
            </div>
            <WebScraper />
          </div>
        );
      case 'plagiarism':
        return (
          <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <h2>Plagiarism Detection</h2>
              <p>Check text for plagiarism against database content with high accuracy</p>
            </div>
            <PlagiarismDetector />
          </div>
        );
      case 'analytics':
        return (
          <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <h2>Analytics Dashboard</h2>
              <p>Real-time metrics and performance analytics</p>
            </div>
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>📊</div>
              <h3>Analytics Coming Soon</h3>
              <p>Advanced analytics and visualization tools will be available here.</p>
            </div>
          </div>
        );
      case 'dataset':
        return (
          <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <h2>Dataset Management</h2>
              <p>Manage and view your training datasets</p>
            </div>
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>📁</div>
              <h3>Dataset Manager Coming Soon</h3>
              <p>Dataset management tools will be available here.</p>
            </div>
          </div>
        );
      case 'models':
        return (
          <div className={styles.contentSection}>
            <div className={styles.sectionHeader}>
              <h2>Model Library</h2>
              <p>View and manage trained neural network models</p>
            </div>
            <div className={styles.placeholder}>
              <div className={styles.placeholderIcon}>🔮</div>
              <h3>Model Library Coming Soon</h3>
              <p>Model management and versioning tools will be available here.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.dashboard}>
      <AnimatedBackground />
      <FloatingParticles />
      <SideNav activeSection={activeSection} onSectionChange={setActiveSection} />
      <main className={styles.mainContent}>
        <div className={`${styles.contentWrapper} ${isVisible ? styles.visible : ''}`}>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

