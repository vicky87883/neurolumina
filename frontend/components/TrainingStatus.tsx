'use client';

import { useState, useEffect } from 'react';
import { getTrainingStatus, startTraining, TrainingStatus as TrainingStatusType } from '@/lib/api';
import styles from './TrainingStatus.module.css';

export default function TrainingStatus() {
  const [status, setStatus] = useState<TrainingStatusType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numSteps, setNumSteps] = useState(100);
  const [batchSize, setBatchSize] = useState(32);

  const fetchStatus = async () => {
    try {
      const data = await getTrainingStatus();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleStartTraining = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await startTraining(numSteps, batchSize);
      await fetchStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start training');
    } finally {
      setIsLoading(false);
    }
  };

  if (!status) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading training status...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Training Status</h2>

      <div className={styles.statusGrid}>
        <div className={styles.statusCard}>
          <div className={styles.statusLabel}>Status</div>
          <div className={`${styles.statusValue} ${status.is_training ? styles.training : ''}`}>
            {status.is_training ? 'Training' : status.status}
          </div>
        </div>

        <div className={styles.statusCard}>
          <div className={styles.statusLabel}>Epoch</div>
          <div className={styles.statusValue}>{status.current_epoch}</div>
        </div>

        <div className={styles.statusCard}>
          <div className={styles.statusLabel}>Dataset Size</div>
          <div className={styles.statusValue}>{status.dataset_size}</div>
        </div>

        <div className={styles.statusCard}>
          <div className={styles.statusLabel}>Steps Completed</div>
          <div className={styles.statusValue}>{status.steps_completed}</div>
        </div>

        <div className={styles.statusCard}>
          <div className={styles.statusLabel}>Mean Reward</div>
          <div className={styles.statusValue}>{status.mean_reward.toFixed(3)}</div>
        </div>

        <div className={styles.statusCard}>
          <div className={styles.statusLabel}>Latest Loss</div>
          <div className={styles.statusValue}>{status.latest_loss.toFixed(4)}</div>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.controls}>
        <div className={styles.inputGroup}>
          <label>
            Steps:
            <input
              type="number"
              value={numSteps}
              onChange={(e) => setNumSteps(Number(e.target.value))}
              min={1}
              max={1000}
              disabled={status.is_training}
            />
          </label>
        </div>

        <div className={styles.inputGroup}>
          <label>
            Batch Size:
            <input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(Number(e.target.value))}
              min={1}
              max={128}
              disabled={status.is_training}
            />
          </label>
        </div>

        <button
          className={styles.startButton}
          onClick={handleStartTraining}
          disabled={status.is_training || isLoading}
        >
          {status.is_training || isLoading ? 'Training...' : 'Start Training'}
        </button>
      </div>
    </div>
  );
}

