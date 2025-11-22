'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from '@/styles/UniversityLogo.module.css';

interface UniversityLogoProps {
  name: string;
  className?: string;
}

const universityLogos: Record<string, { src: string; alt: string; width?: number; height?: number; useImage?: boolean }> = {
  MIT: {
    src: '/mit-logo-png_seeklogo-93472.png',
    alt: 'MIT Logo',
    width: 120,
    height: 40,
    useImage: true
  },
  Cambridge: {
    src: '/university-of-cambridge-logo-vector-free-download-11574209214d99rtlntg8.png',
    alt: 'University of Cambridge Logo',
    width: 140,
    height: 40,
    useImage: true
  },
  Oxford: {
    src: '/images.png',
    alt: 'Oxford University Logo',
    width: 120,
    height: 40,
    useImage: false
  },
  Harvard: {
    src: '/042e5687c6e01b688391632009eecc.webp',
    alt: 'Harvard University Logo',
    width: 120,
    height: 40,
    useImage: true
  },
  Stanford: {
    src: '/Stanford-Symbol.png',
    alt: 'Stanford University Logo',
    width: 130,
    height: 40,
    useImage: true
  },
  'ETH Zurich': {
    src: '/images.jpeg',
    alt: 'ETH Zurich Logo',
    width: 120,
    height: 40,
    useImage: false
  },
  Caltech: {
    src: '/images.png',
    alt: 'Caltech Logo',
    width: 120,
    height: 40,
    useImage: false
  },
  Princeton: {
    src: '/images.png',
    alt: 'Princeton University Logo',
    width: 120,
    height: 40,
    useImage: false
  },
};

export default function UniversityLogo({ name, className = '' }: UniversityLogoProps) {
  const [imageError, setImageError] = useState(false);
  const logo = universityLogos[name];
  
  // Use text-based logo if image is not available or useImage is false
  if (!logo || imageError || !logo.useImage) {
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
          width={logo.width || 120}
          height={logo.height || 40}
          className={styles.logoImage}
          onError={() => setImageError(true)}
          loading="lazy"
        />
      </div>
    </div>
  );
}
