import { classifyFirestoreError } from './errorClassification';
import { logger } from '../observability/logger';

export interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffFactor?: number;
  operationName?: string;
  correlationId?: string;
}

/**
 * Executes an async operation with bounded exponential backoff and jitter.
 * Automatically halts immediately on non-retryable errors (e.g. permission-denied, invalid-argument).
 */
export async function withBoundedRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const initialDelayMs = options.initialDelayMs ?? 200;
  const maxDelayMs = options.maxDelayMs ?? 2000;
  const backoffFactor = options.backoffFactor ?? 2;
  const opName = options.operationName ?? 'AsyncOperation';
  const correlationId = options.correlationId;

  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      return await fn();
    } catch (err: any) {
      const classified = classifyFirestoreError(err);

      // If error is strictly non-retryable or we reached max attempts, fail fast
      if (!classified.retryable || attempt >= maxAttempts) {
        if (attempt > 1) {
          logger.error(
            'FIRESTORE_REPOSITORY',
            `${opName}:RetryExhausted`,
            `Failed after ${attempt} attempts: ${err.message}`,
            { attempt, maxAttempts, rawCode: classified.rawCode },
            classified.rawCode,
            false,
            correlationId
          );
        }
        throw err;
      }

      // Calculate exponential backoff with random jitter (10-30%)
      const jitter = delay * (0.1 + Math.random() * 0.2);
      const sleepTime = Math.min(delay + jitter, maxDelayMs);

      logger.warn(
        'FIRESTORE_REPOSITORY',
        `${opName}:RetryAttempt`,
        `Attempt ${attempt} failed with ${classified.rawCode}. Retrying in ${Math.round(sleepTime)}ms...`,
        { attempt, maxAttempts, sleepTimeMs: sleepTime },
        correlationId
      );

      await new Promise((resolve) => setTimeout(resolve, sleepTime));
      delay *= backoffFactor;
    }
  }

  throw new Error(`${opName} failed after ${maxAttempts} attempts.`);
}
