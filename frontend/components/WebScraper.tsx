'use client';

import { useState } from 'react';
import { scrapeUrl, getScrapedContent } from '@/lib/api';
import LoadingSpinner from './LoadingSpinner';
import styles from './WebScraper.module.css';

interface ScrapedResult {
  url: string;
  title: string;
  text: string;
  links?: Array<{ url: string; text: string }>;
  images?: Array<{ url: string; alt: string }>;
  metadata?: Record<string, any>;
}

export default function WebScraper() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScrapedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedContent, setSavedContent] = useState<any[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  const handleScrape = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await scrapeUrl({
        url: url.trim(),
        extract_text: true,
        extract_links: true,
        extract_images: false,
      });

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToDB = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://13.203.154.38:8000';
      const response = await fetch(`${API_BASE_URL}/api/scraping/save-to-db`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          extract_text: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save to database');
      }

      const data = await response.json();
      alert(`Saved to database! ID: ${data.id}`);
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save to database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadSaved = async () => {
    try {
      const data = await getScrapedContent(10, 0);
      setSavedContent(data.content || []);
      setShowSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load saved content');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Web Scraper</h2>
        <p>Extract content from any website and save to database</p>
      </div>

      <div className={styles.inputSection}>
        <div className={styles.inputGroup}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to scrape (e.g., https://example.com)"
            className={styles.urlInput}
            disabled={isLoading}
          />
          <div className={styles.buttonGroup}>
            <button
              onClick={handleScrape}
              disabled={isLoading || !url.trim()}
              className={styles.scrapeButton}
            >
              {isLoading ? <LoadingSpinner /> : 'Scrape'}
            </button>
            <button
              onClick={handleSaveToDB}
              disabled={isLoading || !url.trim()}
              className={styles.saveButton}
            >
              Scrape & Save to DB
            </button>
            <button
              onClick={handleLoadSaved}
              className={styles.loadButton}
            >
              Load Saved
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {showSaved && savedContent.length > 0 && (
        <div className={styles.savedSection}>
          <h3>Saved Content ({savedContent.length})</h3>
          <div className={styles.savedList}>
            {savedContent.map((item, idx) => (
              <div key={idx} className={styles.savedItem}>
                <h4>{item.title || 'No Title'}</h4>
                <p className={styles.savedUrl}>{item.url}</p>
                <p className={styles.savedContent}>
                  {item.content?.substring(0, 200)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {result && (
        <div className={styles.result}>
          <div className={styles.resultHeader}>
            <h3>{result.title || 'Scraped Content'}</h3>
            <a href={result.url} target="_blank" rel="noopener noreferrer" className={styles.resultUrl}>
              {result.url}
            </a>
          </div>

          <div className={styles.resultContent}>
            <div className={styles.textSection}>
              <h4>Content</h4>
              <p>{result.text}</p>
            </div>

            {result.links && result.links.length > 0 && (
              <div className={styles.linksSection}>
                <h4>Links ({result.links.length})</h4>
                <div className={styles.linksList}>
                  {result.links.slice(0, 10).map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.linkItem}
                    >
                      {link.text || link.url}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {result.metadata && Object.keys(result.metadata).length > 0 && (
              <div className={styles.metadataSection}>
                <h4>Metadata</h4>
                <pre className={styles.metadata}>
                  {JSON.stringify(result.metadata, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

