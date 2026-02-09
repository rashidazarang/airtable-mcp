import { setTimeout as delay } from 'node:timers/promises';

/**
 * Lightweight token-based rate limiter to enforce Airtable quotas.
 * Maintains per-key queues to preserve ordering and fairness.
 */
export class RateLimiter {
  private readonly minIntervalMs: number;
  private readonly lockByKey = new Map<string, Promise<void>>();
  private readonly nextAvailableByKey = new Map<string, number>();

  constructor({ maxRequestsPerSecond }: { maxRequestsPerSecond: number }) {
    if (maxRequestsPerSecond <= 0) {
      throw new Error('maxRequestsPerSecond must be greater than zero');
    }
    this.minIntervalMs = Math.ceil(1000 / maxRequestsPerSecond);
  }

  async schedule(key: string): Promise<void> {
    const previous = this.lockByKey.get(key) ?? Promise.resolve();
    let release: () => void = () => undefined;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });

    this.lockByKey.set(
      key,
      previous.then(() => current)
    );

    await previous;

    const now = Date.now();
    const availableAt = this.nextAvailableByKey.get(key) ?? now;
    const waitMs = Math.max(availableAt - now, 0);
    if (waitMs > 0) {
      await delay(waitMs);
    }

    this.nextAvailableByKey.set(key, Date.now() + this.minIntervalMs);
    release();
  }
}
