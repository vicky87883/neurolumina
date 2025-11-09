'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated, validateToken, getUserData } from '@/lib/auth';
import styles from '@/styles/Branches.module.css';

interface Branch {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  subjects: string[];
}

const branches: Branch[] = [
  {
    id: 'cs',
    name: 'Computer Science',
    description: 'Algorithms, AI, Machine Learning, Software Engineering, and more',
    icon: '💻',
    color: '#6366f1',
    subjects: ['AI & ML', 'Data Structures', 'Algorithms', 'Software Engineering', 'Database Systems', 'Web Development']
  },
  {
    id: 'physics',
    name: 'Physics',
    description: 'Quantum Mechanics, Astrophysics, Theoretical Physics, and more',
    icon: '⚛️',
    color: '#8b5cf6',
    subjects: ['Quantum Physics', 'Astrophysics', 'Theoretical Physics', 'Particle Physics', 'Condensed Matter', 'Optics']
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    description: 'Organic Chemistry, Biochemistry, Physical Chemistry, and more',
    icon: '🧪',
    color: '#ec4899',
    subjects: ['Organic Chemistry', 'Biochemistry', 'Physical Chemistry', 'Analytical Chemistry', 'Inorganic Chemistry', 'Materials Science']
  },
  {
    id: 'biology',
    name: 'Biology',
    description: 'Molecular Biology, Genetics, Ecology, Microbiology, and more',
    icon: '🧬',
    color: '#10b981',
    subjects: ['Molecular Biology', 'Genetics', 'Ecology', 'Microbiology', 'Biochemistry', 'Evolution']
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    description: 'Calculus, Algebra, Statistics, Applied Mathematics, and more',
    icon: '📐',
    color: '#f59e0b',
    subjects: ['Calculus', 'Linear Algebra', 'Statistics', 'Number Theory', 'Differential Equations', 'Topology']
  },
  {
    id: 'engineering',
    name: 'Engineering',
    description: 'Mechanical, Electrical, Civil, Aerospace Engineering, and more',
    icon: '⚙️',
    color: '#ef4444',
    subjects: ['Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Aerospace', 'Chemical Engineering', 'Biomedical']
  },
  {
    id: 'medicine',
    name: 'Medicine',
    description: 'Anatomy, Pharmacology, Surgery, Public Health, and more',
    icon: '🏥',
    color: '#06b6d4',
    subjects: ['Anatomy', 'Pharmacology', 'Surgery', 'Public Health', 'Pathology', 'Immunology']
  },
  {
    id: 'economics',
    name: 'Economics',
    description: 'Microeconomics, Macroeconomics, Econometrics, Finance, and more',
    icon: '📊',
    color: '#84cc16',
    subjects: ['Microeconomics', 'Macroeconomics', 'Econometrics', 'Finance', 'International Economics', 'Behavioral Economics']
  },
];

export default function BranchesPage() {
  const router = useRouter();
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setUser(userData);
    }
  }, []);

  const handleBranchSelect = (branchId: string) => {
    setSelectedBranch(branchId);
    // Store selected branch in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('selected_branch', branchId);
    }
    // Redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link href="/" className={styles.logo}>
          <svg className={styles.logoSvg} viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="branchLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
            <circle cx="20" cy="20" r="18" fill="url(#branchLogoGradient)" opacity="0.2" />
            <path 
              d="M20 8 L20 32 M8 20 L32 20 M14 14 L26 26 M26 14 L14 26" 
              stroke="url(#branchLogoGradient)" 
              strokeWidth="2.5" 
              strokeLinecap="round"
            />
            <circle cx="20" cy="20" r="3" fill="url(#branchLogoGradient)" />
          </svg>
          <span className={styles.logoText}>IntelliThesis</span>
        </Link>
        {user && (
          <div className={styles.userInfo}>
            <span>Welcome, {user.username || user.email}</span>
          </div>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.intro}>
          <h1 className={styles.title}>Select Your Research Branch</h1>
          <p className={styles.description}>
            Choose your field of study to get personalized research tools and resources
          </p>
        </div>

        <div className={styles.branchesGrid}>
          {branches.map((branch) => (
            <div
              key={branch.id}
              className={`${styles.branchCard} ${selectedBranch === branch.id ? styles.selected : ''}`}
              onClick={() => handleBranchSelect(branch.id)}
              style={{ '--branch-color': branch.color } as React.CSSProperties}
            >
              <div className={styles.branchIcon} style={{ background: `${branch.color}20` }}>
                <span className={styles.iconEmoji}>{branch.icon}</span>
              </div>
              <h3 className={styles.branchName}>{branch.name}</h3>
              <p className={styles.branchDescription}>{branch.description}</p>
              <div className={styles.subjects}>
                {branch.subjects.slice(0, 3).map((subject, idx) => (
                  <span key={idx} className={styles.subjectTag}>
                    {subject}
                  </span>
                ))}
                {branch.subjects.length > 3 && (
                  <span className={styles.moreTag}>+{branch.subjects.length - 3} more</span>
                )}
              </div>
              <div className={styles.selectButton}>
                Select Branch
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

