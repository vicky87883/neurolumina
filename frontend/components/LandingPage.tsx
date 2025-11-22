'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { isAuthenticated, validateToken } from '@/lib/auth';
import UniversityLogo from '@/components/UniversityLogo';
import ThemeToggle from '@/components/ThemeToggle';
import styles from '@/styles/LandingPage.module.css';

export default function LandingPage() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isSliderPaused, setIsSliderPaused] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    if (isAuthenticated() && validateToken()) {
      router.push('/dashboard');
    }
  }, [router]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Animated background gradient */}
      <div 
        className={styles.animatedBackground}
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(120, 119, 198, 0.3), transparent 40%)`
        }}
      />

      {/* Navigation */}
      <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoWrapper}>
              <svg className={styles.logoSvg} viewBox="0 0 40 40" fill="none">
                <defs>
                  <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <circle cx="20" cy="20" r="18" fill="url(#logoGradient)" opacity="0.2" />
                <path 
                  d="M20 8 L20 32 M8 20 L32 20 M14 14 L26 26 M26 14 L14 26" 
                  stroke="url(#logoGradient)" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                  className={styles.logoPath}
                />
                <circle cx="20" cy="20" r="3" fill="url(#logoGradient)" />
              </svg>
              <span className={styles.logoText}>IntelliThesis</span>
            </div>
          </Link>
          <div className={styles.navLinks}>
            <a href="#features" className={styles.navLink}>Features</a>
            <a href="#solutions" className={styles.navLink}>Solutions</a>
            <a href="#pricing" className={styles.navLink}>Pricing</a>
            <Link href="/blog" className={styles.navLink}>Blog</Link>
            <Link href="/careers" className={styles.navLink}>Careers</Link>
            <ThemeToggle />
            <Link href="/login" className={styles.navButton}>
              Sign In
            </Link>
            <Link href="/signup" className={styles.navButtonPrimary}>
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBackgroundImage}></div>
        <div className={styles.heroContainer}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span className={styles.badgeIcon}>🚀</span>
              <span>Advanced Research Platform Powered by AI</span>
            </div>
            <h1 className={styles.heroTitle}>
              Build Advanced Research Tools
              <span className={styles.gradientText}> with AI</span>
            </h1>
            <p className={styles.heroDescription}>
              The complete platform for researchers, students, and professionals. 
              Detect plagiarism, scrape web content, train custom LLM models, and 
              unlock the power of artificial intelligence for your research workflow.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/signup" className={styles.ctaPrimary}>
                Start Free Trial
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
              <Link href="/login" className={styles.ctaSecondary}>
                Sign In
              </Link>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>99.9%</div>
                <div className={styles.statLabel}>Accuracy</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>10K+</div>
                <div className={styles.statLabel}>Researchers</div>
              </div>
              <div className={styles.statItem}>
                <div className={styles.statNumber}>1M+</div>
                <div className={styles.statLabel}>Documents Processed</div>
              </div>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.researchPapers}>
              <div className={`${styles.paper} ${styles.paper1}`}>
                <div className={styles.paperHeader}>
                  <div className={styles.paperTitle}>Research Paper</div>
                  <div className={styles.paperLines}>
                    <div className={styles.paperLine}></div>
                    <div className={styles.paperLine}></div>
                    <div className={styles.paperLine}></div>
                  </div>
                </div>
                <div className={styles.paperContent}>
                  <div className={styles.paperText}>Abstract: Machine Learning...</div>
                  <div className={styles.paperText}>Methodology: Deep Neural...</div>
                  <div className={styles.paperText}>Results: 99.9% accuracy...</div>
                </div>
              </div>
              <div className={`${styles.paper} ${styles.paper2}`}>
                <div className={styles.paperHeader}>
                  <div className={styles.paperTitle}>Thesis Document</div>
                  <div className={styles.paperLines}>
                    <div className={styles.paperLine}></div>
                    <div className={styles.paperLine}></div>
                  </div>
                </div>
                <div className={styles.paperContent}>
                  <div className={styles.paperText}>Chapter 1: Introduction...</div>
                  <div className={styles.paperText}>Chapter 2: Literature Review...</div>
                </div>
              </div>
              <div className={`${styles.paper} ${styles.paper3}`}>
                <div className={styles.paperHeader}>
                  <div className={styles.paperTitle}>Research Data</div>
                  <div className={styles.paperLines}>
                    <div className={styles.paperLine}></div>
                    <div className={styles.paperLine}></div>
                    <div className={styles.paperLine}></div>
                    <div className={styles.paperLine}></div>
                  </div>
                </div>
                <div className={styles.paperContent}>
                  <div className={styles.paperText}>Dataset: 10K samples...</div>
                  <div className={styles.paperText}>Analysis: Statistical...</div>
                </div>
              </div>
            </div>
            <div className={styles.visualCard}>
              <div className={styles.cardHeader}>
                <div className={styles.cardDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className={styles.cardTitle}>code.py</div>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.codeBlock}>
                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>1</span>
                    <span className={styles.codeText}>
                      <span className={styles.codeKeyword}>from</span> intellithesis <span className={styles.codeKeyword}>import</span> <span className={styles.codeFunction}>PlagiarismDetector</span>
                    </span>
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>2</span>
                    <span className={styles.codeText}></span>
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>3</span>
                    <span className={styles.codeText}><span className={styles.codeComment}># Initialize detector</span></span>
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>4</span>
                    <span className={styles.codeText}>detector = <span className={styles.codeFunction}>PlagiarismDetector</span>()</span>
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>5</span>
                    <span className={styles.codeText}></span>
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>6</span>
                    <span className={styles.codeText}><span className={styles.codeComment}># Analyze document</span></span>
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>7</span>
                    <span className={styles.codeText}>result = detector.<span className={styles.codeFunction}>analyze</span>(<span className={styles.codeString}>"document.pdf"</span>)</span>
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>8</span>
                    <span className={styles.codeText}></span>
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>9</span>
                    <span className={styles.codeText}><span className={styles.codeFunction}>print</span>(result.<span className={styles.codeProperty}>similarity</span>)</span>
                  </div>
                  <div className={styles.codeLine}>
                    <span className={styles.lineNumber}>10</span>
                    <span className={styles.codeText}><span className={styles.codeComment}># Output: 99.9% accuracy</span></span>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.floatingElements}>
              <div className={`${styles.floatingElement} ${styles.element1}`}>
                <div className={styles.elementIcon}>🔍</div>
                <div className={styles.elementText}>Plagiarism Detection</div>
              </div>
              <div className={`${styles.floatingElement} ${styles.element2}`}>
                <div className={styles.elementIcon}>🕷️</div>
                <div className={styles.elementText}>Web Scraping</div>
              </div>
              <div className={`${styles.floatingElement} ${styles.element3}`}>
                <div className={styles.elementIcon}>🤖</div>
                <div className={styles.elementText}>AI Training</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className={styles.trustedBySection}>
        <div className={styles.sectionContainer}>
          <div className={styles.trustedByHeader}>
            <p className={styles.trustedByLabel}>Trusted by researchers at</p>
          </div>
          <div 
            className={styles.trustedBySlider}
            onMouseEnter={() => setIsSliderPaused(true)}
            onMouseLeave={() => setIsSliderPaused(false)}
          >
            <div 
              className={styles.sliderTrack}
              style={{ animationPlayState: isSliderPaused ? 'paused' : 'running' }}
            >
              <div className={styles.sliderContent}>
                {/* First set of logos */}
                <div className={styles.universityLogo}>
                  <UniversityLogo name="MIT" />
                </div>
                <div className={styles.universityLogo}>
                  <UniversityLogo name="Cambridge" />
                </div>
                <div className={styles.universityLogo}>
                  <UniversityLogo name="Stanford" />
                </div>
                <div className={styles.universityLogo}>
                  <UniversityLogo name="Harvard" />
                </div>
                <div className={styles.universityLogo}>
                  <UniversityLogo name="Oxford" />
                </div>
                <div className={styles.universityLogo}>
                  <UniversityLogo name="ETH Zurich" />
                </div>
                <div className={styles.universityLogo}>
                  <UniversityLogo name="Caltech" />
                </div>
                <div className={styles.universityLogo}>
                  <UniversityLogo name="Princeton" />
                </div>
                {/* Duplicate set for infinite scroll */}
                <div className={styles.universityLogo}>
                  <UniversityLogo name="MIT" />
                </div>
                <div className={styles.universityLogo}>
                  <UniversityLogo name="Cambridge" />
                </div>
                <div className={styles.universityLogo}>
                  <UniversityLogo name="Stanford" />
                </div>
                <div className={styles.universityLogo}>
                  <UniversityLogo name="Harvard" />
                </div>
                <div className={styles.universityLogo}>
                  <UniversityLogo name="Oxford" />
                </div>
                <div className={styles.universityLogo}>
                  <UniversityLogo name="ETH Zurich" />
                </div>
                <div className={styles.universityLogo}>
                  <UniversityLogo name="Caltech" />
                </div>
                <div className={styles.universityLogo}>
                  <UniversityLogo name="Princeton" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Streams Section */}
      <section id="streams" className={styles.streams}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Explore by Stream</h2>
            <p className={styles.sectionDescription}>
              Discover specialized resources and tools for your field of study
            </p>
          </div>
          <div className={styles.streamsGrid}>
            <Link href="/streams/physics" className={styles.streamCard}>
              <div className={styles.streamIcon}>⚛️</div>
              <h3 className={styles.streamTitle}>Physics</h3>
              <p className={styles.streamDescription}>
                Research papers, quantum mechanics, theoretical physics, and cutting-edge discoveries
              </p>
              <div className={styles.streamArrow}>→</div>
            </Link>
            <Link href="/streams/computer-science" className={styles.streamCard}>
              <div className={styles.streamIcon}>💻</div>
              <h3 className={styles.streamTitle}>Computer Science</h3>
              <p className={styles.streamDescription}>
                Algorithms, code snippets, AI/ML research, and software engineering insights
              </p>
              <div className={styles.streamArrow}>→</div>
            </Link>
            <Link href="/streams/chemistry" className={styles.streamCard}>
              <div className={styles.streamIcon}>🧪</div>
              <h3 className={styles.streamTitle}>Chemistry</h3>
              <p className={styles.streamDescription}>
                Organic synthesis, molecular structures, and chemical research papers
              </p>
              <div className={styles.streamArrow}>→</div>
            </Link>
            <Link href="/streams/mathematics" className={styles.streamCard}>
              <div className={styles.streamIcon}>📐</div>
              <h3 className={styles.streamTitle}>Mathematics</h3>
              <p className={styles.streamDescription}>
                Pure mathematics, proofs, equations, and mathematical research
              </p>
              <div className={styles.streamArrow}>→</div>
            </Link>
            <Link href="/streams/biology" className={styles.streamCard}>
              <div className={styles.streamIcon}>🧬</div>
              <h3 className={styles.streamTitle}>Biology</h3>
              <p className={styles.streamDescription}>
                Genetics, molecular biology, ecology, and life sciences research
              </p>
              <div className={styles.streamArrow}>→</div>
            </Link>
            <Link href="/streams/engineering" className={styles.streamCard}>
              <div className={styles.streamIcon}>⚙️</div>
              <h3 className={styles.streamTitle}>Engineering</h3>
              <p className={styles.streamDescription}>
                Mechanical, electrical, civil, and aerospace engineering resources
              </p>
              <div className={styles.streamArrow}>→</div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className={styles.features}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Powerful Features</h2>
            <p className={styles.sectionDescription}>
              Everything you need to build advanced research applications
            </p>
          </div>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <div className={styles.featureIcon}>🔍</div>
              </div>
              <h3 className={styles.featureTitle}>Plagiarism Detection</h3>
              <p className={styles.featureDescription}>
                High-efficiency algorithm with 99.9% accuracy. Scans database content 
                and provides comprehensive similarity analysis with detailed reports.
              </p>
              <div className={styles.featureTags}>
                <span>High Accuracy</span>
                <span>Fast Processing</span>
                <span>Detailed Reports</span>
              </div>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <div className={styles.featureIcon}>🕷️</div>
              </div>
              <h3 className={styles.featureTitle}>Advanced Web Scraping</h3>
              <p className={styles.featureDescription}>
                Selenium-powered scraper that handles JavaScript-heavy sites, 
                bypasses Cloudflare, and extracts content with precision. Supports 
                multiple scraping strategies.
              </p>
              <div className={styles.featureTags}>
                <span>Cloudflare Bypass</span>
                <span>JavaScript Support</span>
                <span>Multi-Strategy</span>
              </div>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <div className={styles.featureIcon}>🤖</div>
              </div>
              <h3 className={styles.featureTitle}>LLM Training</h3>
              <p className={styles.featureDescription}>
                Train custom language models with reinforcement learning (PPO). 
                Monitor training progress, optimize performance, and deploy 
                production-ready models.
              </p>
              <div className={styles.featureTags}>
                <span>PPO Algorithm</span>
                <span>Real-time Monitoring</span>
                <span>Production Ready</span>
              </div>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <div className={styles.featureIcon}>📊</div>
              </div>
              <h3 className={styles.featureTitle}>Analytics Dashboard</h3>
              <p className={styles.featureDescription}>
                Comprehensive analytics and monitoring tools to track your 
                research progress, model performance, and dataset statistics.
              </p>
              <div className={styles.featureTags}>
                <span>Real-time Metrics</span>
                <span>Visual Analytics</span>
                <span>Export Data</span>
              </div>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <div className={styles.featureIcon}>🔒</div>
              </div>
              <h3 className={styles.featureTitle}>Enterprise Security</h3>
              <p className={styles.featureDescription}>
                Your data is encrypted and stored securely with enterprise-grade 
                security. We prioritize your privacy and data protection.
              </p>
              <div className={styles.featureTags}>
                <span>End-to-End Encryption</span>
                <span>SOC 2 Certified</span>
                <span>GDPR Compliant</span>
              </div>
            </div>

            <div className={styles.featureCard}>
              <div className={styles.featureIconWrapper}>
                <div className={styles.featureIcon}>⚡</div>
              </div>
              <h3 className={styles.featureTitle}>Lightning Fast</h3>
              <p className={styles.featureDescription}>
                Optimized algorithms and efficient database queries ensure 
                fast performance even with large datasets. Process millions 
                of documents in seconds.
              </p>
              <div className={styles.featureTags}>
                <span>High Performance</span>
                <span>Scalable</span>
                <span>Optimized</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className={styles.solutions}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Built for Researchers</h2>
            <p className={styles.sectionDescription}>
              Perfect for academic research, content creation, and AI development
            </p>
          </div>
          <div className={styles.solutionsGrid}>
            <div className={styles.solutionCard}>
              <div className={styles.solutionIcon}>🎓</div>
              <h3>Academic Research</h3>
              <p>Perfect for students and researchers. Detect plagiarism, 
              manage references, and ensure academic integrity.</p>
            </div>
            <div className={styles.solutionCard}>
              <div className={styles.solutionIcon}>📝</div>
              <h3>Content Creation</h3>
              <p>Scrape web content, analyze sources, and create original 
              content with confidence.</p>
            </div>
            <div className={styles.solutionCard}>
              <div className={styles.solutionIcon}>🚀</div>
              <h3>AI Development</h3>
              <p>Train custom LLM models, fine-tune for your use case, 
              and deploy production-ready AI applications.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={styles.pricing}>
        <div className={styles.sectionContainer}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Simple, Transparent Pricing</h2>
            <p className={styles.sectionDescription}>
              Choose the plan that's right for your research needs
            </p>
          </div>
          <div className={styles.pricingGrid}>
            <div className={styles.pricingCard}>
              <div className={styles.pricingHeader}>
                <h3 className={styles.pricingTitle}>Starter</h3>
                <div className={styles.pricingPrice}>
                  <span className={styles.priceAmount}>Free</span>
                </div>
                <p className={styles.pricingDescription}>Perfect for getting started</p>
              </div>
              <ul className={styles.pricingFeatures}>
                <li>✓ Up to 100 documents/month</li>
                <li>✓ Basic plagiarism detection</li>
                <li>✓ Web scraping (limited)</li>
                <li>✓ Community support</li>
              </ul>
              <Link href="/signup" className={styles.pricingButton}>
                Get Started
              </Link>
            </div>

            <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
              <div className={styles.featuredBadge}>Popular</div>
              <div className={styles.pricingHeader}>
                <h3 className={styles.pricingTitle}>Professional</h3>
                <div className={styles.pricingPrice}>
                  <span className={styles.priceCurrency}>$</span>
                  <span className={styles.priceAmount}>29</span>
                  <span className={styles.pricePeriod}>/month</span>
                </div>
                <p className={styles.pricingDescription}>For researchers and professionals</p>
              </div>
              <ul className={styles.pricingFeatures}>
                <li>✓ Unlimited documents</li>
                <li>✓ Advanced plagiarism detection</li>
                <li>✓ Full web scraping capabilities</li>
                <li>✓ LLM training (basic)</li>
                <li>✓ Priority support</li>
                <li>✓ Analytics dashboard</li>
              </ul>
              <Link href="/signup" className={styles.pricingButtonFeatured}>
                Start Free Trial
              </Link>
            </div>

            <div className={styles.pricingCard}>
              <div className={styles.pricingHeader}>
                <h3 className={styles.pricingTitle}>Enterprise</h3>
                <div className={styles.pricingPrice}>
                  <span className={styles.priceAmount}>Custom</span>
                </div>
                <p className={styles.pricingDescription}>For teams and organizations</p>
              </div>
              <ul className={styles.pricingFeatures}>
                <li>✓ Everything in Professional</li>
                <li>✓ Advanced LLM training</li>
                <li>✓ Custom integrations</li>
                <li>✓ Dedicated support</li>
                <li>✓ SLA guarantee</li>
                <li>✓ Custom deployment</li>
              </ul>
              <Link href="/signup" className={styles.pricingButton}>
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>Ready to Get Started?</h2>
          <p className={styles.ctaDescription}>
            Join thousands of researchers using IntelliThesis to advance their work
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/signup" className={styles.ctaLarge}>
              Start Your Free Trial
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <Link href="/login" className={styles.ctaLargeSecondary}>
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            <div className={styles.footerSection}>
              <div className={styles.footerLogo}>
                <svg className={styles.logoSvg} viewBox="0 0 40 40" fill="none" width="32" height="32">
                  <defs>
                    <linearGradient id="footerLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                  <circle cx="20" cy="20" r="18" fill="url(#footerLogoGradient)" opacity="0.2" />
                  <path 
                    d="M20 8 L20 32 M8 20 L32 20 M14 14 L26 26 M26 14 L14 26" 
                    stroke="url(#footerLogoGradient)" 
                    strokeWidth="2.5" 
                    strokeLinecap="round"
                  />
                  <circle cx="20" cy="20" r="3" fill="url(#footerLogoGradient)" />
                </svg>
                <span className={styles.footerLogoText}>IntelliThesis</span>
              </div>
              <p className={styles.footerDescription}>
                Advanced Research Platform Powered by AI
              </p>
            </div>
            <div className={styles.footerSection}>
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#solutions">Solutions</a>
              <a href="#pricing">Pricing</a>
              <Link href="/login">Login</Link>
            </div>
            <div className={styles.footerSection}>
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#blog">Blog</a>
              <a href="#contact">Contact</a>
              <a href="#careers">Careers</a>
            </div>
            <div className={styles.footerSection}>
              <h4>Resources</h4>
              <a href="#docs">Documentation</a>
              <a href="#support">Support</a>
              <a href="#api">API Reference</a>
              <a href="#community">Community</a>
            </div>
            <div className={styles.footerSection}>
              <h4>Legal</h4>
              <a href="#privacy">Privacy Policy</a>
              <a href="#terms">Terms of Service</a>
              <a href="#security">Security</a>
              <a href="#compliance">Compliance</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>&copy; 2024 IntelliThesis. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
