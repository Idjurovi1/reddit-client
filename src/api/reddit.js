import { createRateLimiter, RateLimitError } from './rateLimiter';
import { mockPosts, mockSubreddits, mockComments } from './mockData';

export const API_ROOT = 'https://www.reddit.com';
const CACHE_TTL_MS = 60_000;

const limiter = createRateLimiter();
const cache = new Map(); // url -> { time, data }

// When the real API can't be reached we fall back to local data so the app is still usable.
let usingMockData = false;
export const isUsingMockData = () => usingMockData;

export const _resetForTests = () => {
  cache.clear();
  limiter.reset();
  usingMockData = false;
};

async function fetchJson(path) {
  const url = `${API_ROOT}${path}`;
  const cached = cache.get(url);
  if (cached && Date.now() - cached.time < CACHE_TTL_MS) return cached.data;

  const wait = limiter.waitTime();
  if (wait > 0) throw new RateLimitError(wait);

  limiter.record();
  const response = await fetch(url);
  if (response.status === 429) {
    const retryAfter = Number(response.headers.get('retry-after')) || 60;
    throw new RateLimitError(retryAfter * 1000);
  }
  if (!response.ok) throw new Error(`Reddit responded with ${response.status}`);

  const json = await response.json();
  cache.set(url, { time: Date.now(), data: json });
  usingMockData = false;
  return json;
}

// Try the real API; on network/CORS failure use mock data. Rate-limit errors are passed on
// so the UI can tell the user to wait and retry.
async function withFallback(request, fallback) {
  try {
    return await request();
  } catch (error) {
    if (error instanceof RateLimitError) throw error;
    usingMockData = true;
    return fallback();
  }
}

const pickPostFields = (p) => ({
  id: p.id,
  title: p.title,
  author: p.author,
  subreddit: p.subreddit,
  score: p.score ?? p.ups ?? 0,
  num_comments: p.num_comments ?? 0,
  created_utc: p.created_utc,
  permalink: p.permalink,
  url: p.url,
  selftext: p.selftext || '',
  image: p.post_hint === 'image' || /\.(jpe?g|png|gif|webp)$/i.test(p.url || '') ? p.url : null,
  is_video: Boolean(p.is_video),
  video: p.is_video ? p.media?.reddit_video?.fallback_url ?? null : null,
});

export async function getSubredditPosts(subreddit = 'popular') {
  return withFallback(
    async () => {
      const json = await fetchJson(`/r/${encodeURIComponent(subreddit)}.json?limit=25&raw_json=1`);
      return json.data.children.map((c) => pickPostFields(c.data));
    },
    () => {
      const list = subreddit === 'popular' ? mockPosts : mockPosts.filter((p) => p.subreddit === subreddit);
      return list.map(pickPostFields);
    },
  );
}

export async function searchPosts(term) {
  return withFallback(
    async () => {
      const json = await fetchJson(`/search.json?q=${encodeURIComponent(term)}&limit=25&raw_json=1`);
      return json.data.children.map((c) => pickPostFields(c.data));
    },
    () => {
      const t = term.toLowerCase();
      return mockPosts
        .filter((p) => p.title.toLowerCase().includes(t) || p.selftext.toLowerCase().includes(t))
        .map(pickPostFields);
    },
  );
}

export async function getSubreddits() {
  return withFallback(
    async () => {
      const json = await fetchJson('/subreddits/popular.json?limit=15&raw_json=1');
      const list = json.data.children.map((c) => ({
        id: c.data.id,
        display_name: c.data.display_name,
        icon_img: c.data.icon_img || c.data.community_icon?.split('?')[0] || '',
        primary_color: c.data.primary_color || '#ff4500',
      }));
      return [{ id: 'popular', display_name: 'popular', icon_img: '', primary_color: '#ff4500' }, ...list];
    },
    () => mockSubreddits,
  );
}

export async function getPostComments(post) {
  return withFallback(
    async () => {
      const json = await fetchJson(`${post.permalink.replace(/\/$/, '')}.json?limit=20&raw_json=1`);
      // Response is [postListing, commentsListing]; "more" entries have kind "more" and no body.
      return json[1].data.children
        .filter((c) => c.kind === 't1')
        .map((c) => ({
          id: c.data.id,
          author: c.data.author,
          body: c.data.body,
          score: c.data.score,
          created_utc: c.data.created_utc,
        }));
    },
    () => mockComments(post.id),
  );
}
