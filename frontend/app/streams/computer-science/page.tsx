'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from '@/components/ThemeToggle';
import styles from '@/styles/StreamPage.module.css';

export default function ComputerSciencePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [codeLines, setCodeLines] = useState<string[]>([]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const code = [
      'function quickSort(arr) {',
      '  if (arr.length <= 1) return arr;',
      '  const pivot = arr[Math.floor(arr.length / 2)];',
      '  const left = arr.filter(x => x < pivot);',
      '  const right = arr.filter(x => x > pivot);',
      '  return [...quickSort(left), pivot, ...quickSort(right)];',
      '}',
      '',
      'class NeuralNetwork {',
      '  constructor(layers) {',
      '    this.layers = layers;',
      '    this.weights = this.initializeWeights();',
      '  }',
      '  forward(input) {',
      '    return this.layers.reduce((acc, layer) =>',
      '      layer.activate(acc), input);',
      '  }',
      '}'
    ];
    setCodeLines(code);
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
            <div className={styles.badge}>💻 Computer Science</div>
            <h1 className={styles.heroTitle}>
              Code, <span className={styles.gradientText}>Innovate</span>, Build
            </h1>
            <p className={styles.heroDescription}>
              Explore algorithms, AI/ML research, software engineering insights, 
              and cutting-edge code snippets from the world's leading developers.
            </p>
          </div>
        </div>
      </section>

      {/* Code Snippets Section */}
      <section className={styles.codeSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Featured Code Snippets</h2>
          <div className={styles.codeContainer}>
            <div className={styles.codeWindow}>
              <div className={styles.codeHeader}>
                <div className={styles.codeDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className={styles.codeTitle}>algorithm.js</div>
              </div>
              <div className={styles.codeContent}>
                {codeLines.map((line, index) => (
                  <div key={index} className={styles.codeLine} style={{ animationDelay: `${index * 0.1}s` }}>
                    <span className={styles.lineNumber}>{index + 1}</span>
                    <span className={styles.codeText}>
                      {line.includes('function') || line.includes('class') ? (
                        <span className={styles.keyword}>{line}</span>
                      ) : line.includes('return') || line.includes('const') || line.includes('if') ? (
                        <span className={styles.keyword}>{line}</span>
                      ) : (
                        line
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Code Animations */}
      <section className={styles.animationsSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>Interactive Code Concepts</h2>
          <div className={styles.animationsGrid}>
            <div className={styles.animationCard}>
              <div className={styles.animationIcon}>🔀</div>
              <h3>Sorting Algorithms</h3>
              <div className={styles.sortAnimation}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className={styles.sortBar} style={{ height: `${i * 20}px`, animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            </div>
            <div className={styles.animationCard}>
              <div className={styles.animationIcon}>🌳</div>
              <h3>Data Structures</h3>
              <div className={styles.treeAnimation}>
                <div className={styles.treeNode}>
                  <div className={styles.treeLeft}></div>
                  <div className={styles.treeRight}></div>
                </div>
              </div>
            </div>
            <div className={styles.animationCard}>
              <div className={styles.animationIcon}>🤖</div>
              <h3>Neural Networks</h3>
              <div className={styles.networkAnimation}>
                {[1, 2, 3].map((i) => (
                  <div key={i} className={styles.networkLayer}>
                    {[1, 2, 3].map((j) => (
                      <div key={j} className={styles.networkNode}></div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className={styles.resourcesSection}>
        <div className={styles.sectionContainer}>
          <h2 className={styles.sectionTitle}>CS Resources</h2>
          <div className={styles.resourcesGrid}>
            <div className={styles.resourceCard}>
              <h3>Code Examples</h3>
              <p>Thousands of code snippets and examples</p>
            </div>
            <div className={styles.resourceCard}>
              <h3>Algorithms</h3>
              <p>Visualizations and implementations</p>
            </div>
            <div className={styles.resourceCard}>
              <h3>AI/ML Papers</h3>
              <p>Latest research in artificial intelligence</p>
            </div>
            <div className={styles.resourceCard}>
              <h3>Developer Tools</h3>
              <p>Tools and frameworks for developers</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

