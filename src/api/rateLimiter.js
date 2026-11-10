// Reddit's free JSON API allows ~10 requests per minute (since July 2023).
// This limiter keeps us safely under that by spacing requests out
// and remembering how many were sent in the last 60 seconds.

export const MAX_REQUESTS = 10;
export const WINDOW_MS = 60_000;

export function createRateLimiter({ max = MAX_REQUESTS, windowMs = WINDOW_MS, now = () => Date.now() } = {}) {
  let timestamps = [];

  const prune = () => {
    const cutoff = now() - windowMs;
    timestamps = timestamps.filter((t) => t > cutoff);
  };

  return {
    // How long (ms) the caller must wait before the next request is allowed.
    waitTime() {
      prune();
      if (timestamps.length < max) return 0;
      return timestamps[0] + windowMs - now();
    },
    // Record that a request was sent.
    record() {
      prune();
      timestamps.push(now());
    },
    remaining() {
      prune();
      return Math.max(0, max - timestamps.length);
    },
    reset() {
      timestamps = [];
    },
  };
}

export class RateLimitError extends Error {
  constructor(retryAfterMs) {
    super(`Reddit rate limit reached. Try again in ${Math.ceil(retryAfterMs / 1000)}s.`);
    this.name = 'RateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}
