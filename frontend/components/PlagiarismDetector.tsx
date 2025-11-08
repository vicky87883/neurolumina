import { useState, useEffect } from 'react';
import { checkPlagiarism, getPlagiarismStats, PlagiarismResult } from '../lib/api';
import styles from '../styles/PlagiarismDetector.module.css';

export default function PlagiarismDetector() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [minSimilarity, setMinSimilarity] = useState(0.3);
  const [stats, setStats] = useState<any>(null);

  const handleCheck = async () => {
    if (!text.trim()) {
      setError('Please enter text to check');
      return;
    }

    setError('');
    setLoading(true);
    setResult(null);

    try {
      const plagiarismResult = await checkPlagiarism({
        text,
        min_similarity: minSimilarity,
        use_chunks: true,
        max_results: 10,
      });
      setResult(plagiarismResult);
    } catch (err: any) {
      setError(err.message || 'Failed to check plagiarism');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getPlagiarismStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const getPlagiarismColor = (percentage: number) => {
    if (percentage < 30) return '#4caf50'; // Green
    if (percentage < 60) return '#ff9800'; // Orange
    return '#f44336'; // Red
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>🔍 Plagiarism Detection</h2>
        <p>Check your text for plagiarism against database content</p>
      </div>

      {stats && (
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.scraped_content_count || 0}</div>
            <div className={styles.statLabel}>Scraped Content</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.training_data_count || 0}</div>
            <div className={styles.statLabel}>Training Data</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.total_content_items || 0}</div>
            <div className={styles.statLabel}>Total Items</div>
          </div>
        </div>
      )}

      <div className={styles.inputSection}>
        <div className={styles.controls}>
          <div className={styles.controlGroup}>
            <label htmlFor="minSimilarity">Minimum Similarity Threshold:</label>
            <input
              type="range"
              id="minSimilarity"
              min="0.1"
              max="1"
              step="0.1"
              value={minSimilarity}
              onChange={(e) => setMinSimilarity(parseFloat(e.target.value))}
            />
            <span className={styles.rangeValue}>{(minSimilarity * 100).toFixed(0)}%</span>
          </div>
        </div>

        <textarea
          className={styles.textArea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text here to check for plagiarism..."
          rows={10}
        />

        <button
          className={styles.checkButton}
          onClick={handleCheck}
          disabled={loading || !text.trim()}
        >
          {loading ? 'Checking...' : 'Check Plagiarism'}
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {result && (
        <div className={styles.results}>
          <div className={styles.resultHeader}>
            <h3>Results</h3>
            <div
              className={styles.plagiarismPercentage}
              style={{ color: getPlagiarismColor(result.plagiarism_percentage) }}
            >
              {result.plagiarism_percentage.toFixed(2)}% Plagiarism
            </div>
          </div>

          <div className={styles.resultStats}>
            <div className={styles.statItem}>
              <span className={styles.statItemLabel}>Status:</span>
              <span
                className={styles.statItemValue}
                style={{ color: result.is_plagiarized ? '#f44336' : '#4caf50' }}
              >
                {result.is_plagiarized ? 'Plagiarized' : 'Original'}
              </span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statItemLabel}>Matches Found:</span>
              <span className={styles.statItemValue}>{result.matches_found}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statItemLabel}>Total Comparisons:</span>
              <span className={styles.statItemValue}>{result.total_comparisons}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statItemLabel}>Text Length:</span>
              <span className={styles.statItemValue}>{result.text_length} characters</span>
            </div>
          </div>

          {result.matches.length > 0 && (
            <div className={styles.matches}>
              <h4>Similar Content Found:</h4>
              {result.matches.map((match, index) => (
                <div key={index} className={styles.matchCard}>
                  <div className={styles.matchHeader}>
                    <div className={styles.matchSource}>
                      <span className={styles.matchSourceType}>{match.source}</span>
                      {match.url && (
                        <a href={match.url} target="_blank" rel="noopener noreferrer" className={styles.matchUrl}>
                          {match.url}
                        </a>
                      )}
                    </div>
                    <div
                      className={styles.matchSimilarity}
                      style={{ color: getPlagiarismColor(match.similarity_percentage) }}
                    >
                      {match.similarity_percentage.toFixed(2)}% Similar
                    </div>
                  </div>
                  {match.title && <div className={styles.matchTitle}>{match.title}</div>}
                  <div className={styles.matchText}>{match.matching_text}</div>
                  {match.date && (
                    <div className={styles.matchDate}>Date: {new Date(match.date).toLocaleDateString()}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

