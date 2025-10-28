/**
 * Lightweight token-based rate limiter to enforce Airtable quotas.
 * Maintains per-key queues to preserve ordering and fairness.
 */
export declare class RateLimiter {
    private readonly minIntervalMs;
    private readonly lockByKey;
    private readonly nextAvailableByKey;
    constructor({ maxRequestsPerSecond }: {
        maxRequestsPerSecond: number;
    });
    schedule(key: string): Promise<void>;
}
