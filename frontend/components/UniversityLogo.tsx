'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/UniversityLogo.module.css';

interface UniversityLogoProps {
  name: string;
  className?: string;
}

const universityLogos: Record<string, { src: string; alt: string; width?: number; height?: number }> = {
  MIT: {
    src: '/mit-logo-png_seeklogo-93472.png',
    alt: 'MIT Logo',
    width: 120,
    height: 40
  },
  Cambridge: {
    src: '/university-of-cambridge-logo-vector-free-download-11574209214d99rtlntg8.png',
    alt: 'University of Cambridge Logo',
    width: 140,
    height: 40
  },
  Oxford: {
    src: '/images.png',
    alt: 'Oxford University Logo',
    width: 200,
    height: 200
  },
  Harvard: {
    src: '/042e5687c6e01b688391632009eecc.webp',
    alt: 'Harvard University Logo',
    width: 120,
    height: 40
  },
  Stanford: {
    src: '/Stanford-Symbol.png',
    alt: 'Stanford University Logo',
    width: 130,
    height: 40
  },
  'ETH Zurich': {
    src: '/images.jpeg',
    alt: 'ETH Zurich Logo',
    width: 100,
    height: 40
  },
  Caltech: {
    src: '/images.png',
    alt: 'Caltech Logo',
    width: 50,
    height: 50
  },
  Princeton: {
    src: '/images.png',
    alt: 'Princeton University Logo',
    width: 50,
    height: 50
  },
};

export default function UniversityLogo({ name, className = '' }: UniversityLogoProps) {
  const [imageError, setImageError] = useState(false);
  const logo = universityLogos[name];
  
  if (!logo || imageError) {
    return (
      <div className={`${styles.logoContainer} ${className}`}>
        <div className={styles.logoText}>{name}</div>
      </div>
    );
  }

  return (
    <div className={`${styles.logoContainer} ${className}`}>
      <div className={styles.logoImageWrapper}>
        <Image
          src={logo.src}
          alt={logo.alt}
          width={logo.width || 100}
          height={logo.height || 40}
          className={styles.logoImage}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
    </div>
  );
}
