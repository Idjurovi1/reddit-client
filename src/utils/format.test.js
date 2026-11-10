import { describe, it, expect } from 'vitest';
import { formatNumber, timeAgo } from './format';

describe('formatNumber', () => {
  it('shortens big numbers', () => {
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(1000)).toBe('1k');
    expect(formatNumber(18420)).toBe('18.4k');
    expect(formatNumber(2_500_000)).toBe('2.5m');
  });
});

describe('timeAgo', () => {
  const now = 1_000_000 * 1000;
  it('describes elapsed time', () => {
    expect(timeAgo(1_000_000 - 30, now)).toBe('just now');
    expect(timeAgo(1_000_000 - 60, now)).toBe('1 minute ago');
    expect(timeAgo(1_000_000 - 3 * 3600, now)).toBe('3 hours ago');
    expect(timeAgo(1_000_000 - 2 * 86_400, now)).toBe('2 days ago');
  });
});
