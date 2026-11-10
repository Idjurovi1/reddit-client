import { describe, it, expect, vi } from 'vitest';
import { screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { renderWithStore, offlineFetch } from './test/utils';

// Integration tests: the whole app with a real store, running on demo data
// (fetch is made to fail exactly like an offline browser).
describe('App', () => {
  const setup = () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(offlineFetch);
    const user = userEvent.setup();
    renderWithStore(<App />);
    return user;
  };

  it('shows an initial feed and the demo banner', async () => {
    setup();
    expect(await screen.findByText(/Sunrise over the Adriatic/)).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/demo data/i);
    expect(screen.getByRole('heading', { level: 1, name: 'r/popular' })).toBeInTheDocument();
  });

  it('filters the feed live while typing', async () => {
    const user = setup();
    await screen.findByText(/Sunrise over the Adriatic/);
    await user.type(screen.getByRole('searchbox'), 'sourdough');
    expect(screen.getByText(/Homemade sourdough/)).toBeInTheDocument();
    expect(screen.queryByText(/Sunrise over the Adriatic/)).not.toBeInTheDocument();
  });

  it('searches Reddit on submit and shows a results heading', async () => {
    const user = setup();
    await screen.findByText(/Sunrise over the Adriatic/);
    await user.type(screen.getByRole('searchbox'), 'cake recipes{Enter}');
    expect(await screen.findByRole('heading', { level: 1, name: /Results for “cake recipes”/ })).toBeInTheDocument();
    expect(screen.getByText(/Best cake recipes that never fail/)).toBeInTheDocument();
  });

  it('lets the user leave an empty-result state', async () => {
    const user = setup();
    await screen.findByText(/Sunrise over the Adriatic/);
    await user.type(screen.getByRole('searchbox'), 'zzzz-nothing');
    expect(screen.getByText(/No posts matching/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Go back' }));
    expect(screen.getByText(/Sunrise over the Adriatic/)).toBeInTheDocument();
  });

  it('filters by subreddit category', async () => {
    const user = setup();
    await screen.findByText(/Sunrise over the Adriatic/);
    const sidebar = screen.getByRole('complementary', { name: 'Subreddits' });
    await user.click(await within(sidebar).findByRole('button', { name: 'r/space' }));
    expect(await screen.findByRole('heading', { level: 1, name: 'r/space' })).toBeInTheDocument();
    expect(screen.getByText(/galaxy cluster/)).toBeInTheDocument();
    expect(screen.queryByText(/Sunrise over the Adriatic/)).not.toBeInTheDocument();
  });

  it('opens a detail modal with comments and closes it with Escape', async () => {
    const user = setup();
    await user.click(await screen.findByRole('button', { name: 'Homemade sourdough after 30 failed attempts' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('heading', { name: /Homemade sourdough/ })).toBeInTheDocument();
    expect(await within(dialog).findByText('u/helpful_dev')).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('toggles comments rendered from Markdown', async () => {
    const user = setup();
    const card = (await screen.findByText(/Sunrise over the Adriatic/)).closest('article');
    await user.click(within(card).getByRole('button', { name: /comments/ }));
    const strong = await within(card).findByText('Saved');
    expect(strong.tagName).toBe('STRONG'); // **Saved** rendered as Markdown
  });

  it('shows an error with a working retry when Reddit rate-limits us', async () => {
    const tooMany = { ok: false, status: 429, headers: { get: () => '1' } };
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(tooMany).mockImplementation(offlineFetch);
    const user = userEvent.setup();
    renderWithStore(<App />);
    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/rate limit/i);
    await user.click(within(alert).getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText(/Sunrise over the Adriatic/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalled();
  });

  it('upvote toggles the score locally', async () => {
    const user = setup();
    const card = (await screen.findByText(/Sunrise over the Adriatic/)).closest('article');
    const up = within(card).getByRole('button', { name: 'Upvote' });
    await user.click(up);
    expect(up).toHaveAttribute('aria-pressed', 'true');
  });
});
