import { describe, it, expect, vi } from 'vitest';
import { getSubredditPosts, searchPosts, getPostComments, isUsingMockData } from './reddit';
import { RateLimitError, createRateLimiter } from './rateLimiter';
import { listing, offlineFetch } from '../test/utils';

const redditPost = {
  id: 'abc',
  title: 'Hello world',
  author: 'tester',
  subreddit: 'webdev',
  score: 42,
  num_comments: 3,
  created_utc: 1_700_000_000,
  permalink: '/r/webdev/comments/abc/hello/',
  url: 'https://i.redd.it/pic.jpg',
  post_hint: 'image',
};

describe('reddit API client', () => {
  it('maps Reddit listing data to app posts', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(listing([redditPost]));
    const posts = await getSubredditPosts('webdev');
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/r/webdev.json'));
    expect(posts).toEqual([expect.objectContaining({ id: 'abc', title: 'Hello world', image: 'https://i.redd.it/pic.jpg' })]);
    expect(isUsingMockData()).toBe(false);
  });

  it('caches identical requests for a minute', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(listing([redditPost]));
    await getSubredditPosts('webdev');
    await getSubredditPosts('webdev');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('falls back to demo data when Reddit is unreachable', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(offlineFetch);
    const posts = await getSubredditPosts('popular');
    expect(posts.length).toBeGreaterThan(0);
    expect(isUsingMockData()).toBe(true);
  });

  it('filters demo search results by term', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(offlineFetch);
    const posts = await searchPosts('cake recipes');
    expect(posts).toHaveLength(1);
    expect(posts[0].title).toMatch(/cake recipes/i);
  });

  it('throws a RateLimitError on HTTP 429 instead of falling back', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({ ok: false, status: 429, headers: { get: () => '30' } });
    await expect(getSubredditPosts('pics')).rejects.toBeInstanceOf(RateLimitError);
  });

  it('keeps only real comments (kind t1)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => [
        {},
        {
          data: {
            children: [
              { kind: 't1', data: { id: 'c1', author: 'a', body: 'hi', score: 1, created_utc: 1 } },
              { kind: 'more', data: { id: 'm1' } },
            ],
          },
        },
      ],
    });
    const comments = await getPostComments({ id: 'abc', permalink: '/r/webdev/comments/abc/hello/' });
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/r/webdev/comments/abc/hello.json'));
    expect(comments).toEqual([{ id: 'c1', author: 'a', body: 'hi', score: 1, created_utc: 1 }]);
  });
});

describe('rate limiter', () => {
  it('allows 10 requests per minute, then asks to wait', () => {
    let t = 0;
    const limiter = createRateLimiter({ now: () => t });
    for (let i = 0; i < 10; i++) {
      expect(limiter.waitTime()).toBe(0);
      limiter.record();
    }
    expect(limiter.remaining()).toBe(0);
    expect(limiter.waitTime()).toBe(60_000);
    t = 60_001; // window passed
    expect(limiter.waitTime()).toBe(0);
  });
});
