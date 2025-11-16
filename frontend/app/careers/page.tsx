'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCareers, Career } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';
import styles from '@/styles/Careers.module.css';

export default function CareersPage() {
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState<Career | null>(null);

  useEffect(() => {
    const fetchCareers = async () => {
      try {
        setLoading(true);
        const data = await getCareers(0, 50, true);
        setCareers(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load career openings');
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, []);

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>
            <svg className={styles.logoSvg} viewBox="0 0 40 40" fill="none">
              <defs>
                <linearGradient id="careerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <circle cx="20" cy="20" r="18" fill="url(#careerLogoGradient)" opacity="0.2" />
              <path 
                d="M20 8 L20 32 M8 20 L32 20 M14 14 L26 26 M26 14 L14 26" 
                stroke="url(#careerLogoGradient)" 
                strokeWidth="2.5" 
                strokeLinecap="round"
              />
              <circle cx="20" cy="20" r="3" fill="url(#careerLogoGradient)" />
            </svg>
            <span className={styles.logoText}>IntelliThesis</span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>Home</Link>
            <Link href="/blog" className={styles.navLink}>Blog</Link>
            <Link href="/careers" className={`${styles.navLink} ${styles.active}`}>Careers</Link>
            <ThemeToggle />
            <Link href="/login" className={styles.navButton}>Sign In</Link>
            <Link href="/signup" className={styles.navButtonPrimary}>Get Started</Link>
          </div>
        </div>
      </nav>

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Join Our Team</h1>
          <p className={styles.description}>
            Help us build the future of research tools powered by AI
          </p>
        </div>

        <div className={styles.benefits}>
          <h2 className={styles.sectionTitle}>Why Join IntelliThesis?</h2>
          <div className={styles.benefitsGrid}>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>🚀</div>
              <h3>Impact</h3>
              <p>Work on cutting-edge AI technology that helps researchers worldwide</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>🌍</div>
              <h3>Remote First</h3>
              <p>Work from anywhere in the world with flexible hours</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>💡</div>
              <h3>Innovation</h3>
              <p>Be part of a team that's pushing the boundaries of AI research</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>👥</div>
              <h3>Great Team</h3>
              <p>Work with talented, passionate people who care about research</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>📈</div>
              <h3>Growth</h3>
              <p>Opportunities for professional development and career advancement</p>
            </div>
            <div className={styles.benefitCard}>
              <div className={styles.benefitIcon}>⚖️</div>
              <h3>Work-Life Balance</h3>
              <p>We believe in sustainable work practices and taking care of our team</p>
            </div>
          </div>
        </div>

        <div className={styles.jobs}>
          <h2 className={styles.sectionTitle}>Open Positions</h2>
          
          {loading && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Loading career openings...</p>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && careers.length === 0 && (
            <div className={styles.empty}>
              <h3>No open positions at the moment</h3>
              <p>Check back soon for new opportunities!</p>
            </div>
          )}

          {!loading && !error && careers.length > 0 && (
            <div className={styles.jobsGrid}>
              {careers.map((job) => (
                <div 
                  key={job.id} 
                  className={styles.jobCard}
                  onClick={() => setSelectedJob(job)}
                >
                  <div className={styles.jobHeader}>
                    <h3 className={styles.jobTitle}>{job.title}</h3>
                    <span className={styles.jobType}>{job.type}</span>
                  </div>
                  <div className={styles.jobMeta}>
                    <span className={styles.jobDepartment}>{job.department}</span>
                    <span className={styles.jobLocation}>{job.location}</span>
                  </div>
                  <p className={styles.jobDescription}>{job.description}</p>
                  {job.salary_range && (
                    <div className={styles.salaryRange}>
                      💰 {job.salary_range}
                    </div>
                  )}
                  <button className={styles.applyButton}>
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedJob && (
          <div className={styles.modal} onClick={() => setSelectedJob(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.modalClose} onClick={() => setSelectedJob(null)}>×</button>
              <h2>{selectedJob.title}</h2>
              <div className={styles.modalMeta}>
                <span>{selectedJob.department}</span>
                <span>{selectedJob.location}</span>
                <span>{selectedJob.type}</span>
                {selectedJob.salary_range && <span>💰 {selectedJob.salary_range}</span>}
              </div>
              <div className={styles.modalDescription}>
                <p>{selectedJob.description}</p>
              </div>
              {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                <div className={styles.modalSection}>
                  <h3>Requirements</h3>
                  <ul>
                    {selectedJob.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                <div className={styles.modalSection}>
                  <h3>Benefits</h3>
                  <ul>
                    {selectedJob.benefits.map((benefit, idx) => (
                      <li key={idx}>{benefit}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className={styles.modalActions}>
                <a href={`mailto:careers@intellithesis.com?subject=Application for ${selectedJob.title}`} className={styles.applyButton}>
                  Apply Now
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
