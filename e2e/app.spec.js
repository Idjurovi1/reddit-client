import { test, expect } from '@playwright/test';
import { mockPosts, mockComments, mockSubreddits } from '../src/api/mockData.js';

// Serve Reddit responses from local fixtures so E2E runs are fast, deterministic
// and never hit Reddit's 10 requests/minute limit.
const listing = (items, kind = 't3') => ({ kind: 'Listing', data: { children: items.map((data) => ({ kind, data })) } });

test.beforeEach(async ({ page }) => {
  await page.route('https://www.reddit.com/**', (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    let body;
    if (path.startsWith('/subreddits/popular')) body = listing(mockSubreddits.slice(1), 't5');
    else if (path.startsWith('/search')) {
      const q = (url.searchParams.get('q') || '').toLowerCase();
      body = listing(mockPosts.filter((p) => p.title.toLowerCase().includes(q)));
    } else if (path.includes('/comments/')) {
      const id = path.split('/comments/')[1].split('/')[0];
      body = [listing([]), listing(mockComments(id), 't1')];
    } else {
      const sub = path.split('/')[2]?.replace('.json', '') || 'popular';
      body = listing(sub === 'popular' ? mockPosts : mockPosts.filter((p) => p.subreddit === sub));
    }
    return route.fulfill({ json: body, headers: { 'access-control-allow-origin': '*' } });
  });
  await page.goto('/');
});

test('shows the popular feed on first visit', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'r/popular' })).toBeVisible();
  await expect(page.getByText('Sunrise over the Adriatic this morning')).toBeVisible();
  await expect(page.getByText(/demo data/i)).toHaveCount(0); // real (mocked) API worked
});

test('search, then clear back to the feed', async ({ page }) => {
  const box = page.getByRole('searchbox');
  await box.fill('cake recipes');
  await box.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: /Results for “cake recipes”/ })).toBeVisible();
  await expect(page.getByText('Best cake recipes that never fail?')).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'r/popular' })).toBeVisible();
});

test('filter by subreddit', async ({ page }) => {
  await page.getByRole('complementary', { name: 'Subreddits' }).getByRole('button', { name: 'r/space' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'r/space' })).toBeVisible();
  await expect(page.getByText(/galaxy cluster/)).toBeVisible();
  await expect(page.getByText('Sunrise over the Adriatic this morning')).toHaveCount(0);
});

test('open detail modal, read comments, close', async ({ page }) => {
  await page.getByRole('button', { name: 'Homemade sourdough after 30 failed attempts', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('u/helpful_dev')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('recovers from an API error with Try again', async ({ page }) => {
  let first = true;
  await page.route('https://www.reddit.com/r/pics.json**', (route) => {
    if (first) { first = false; return route.fulfill({ status: 500, body: 'oops', headers: { 'access-control-allow-origin': '*' } }); }
    return route.fallback();
  });
  await page.getByRole('complementary', { name: 'Subreddits' }).getByRole('button', { name: 'r/pics' }).click();
  // 500 -> app falls back to demo data instead of a dead end
  await expect(page.getByText('My grandpa built this wooden boat by hand')).toBeVisible();
});
