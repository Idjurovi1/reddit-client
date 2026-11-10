# Reddit Minimal

A fast, clean Reddit client built with **React 19** and **Redux Toolkit**. Browse popular posts, filter by subreddit, search all of Reddit and read comments rendered from Markdown, on any screen size.

Portfolio project from the Codecademy Front-End Engineer career path.

## Wireframes

```
Desktop                                             Mobile
┌──────────────────────────────────────────────┐    ┌──────────────────────┐
│ (r/) RedditMinimal      [ Search posts… 🔍 ] │    │ (r/) [ Search…    🔍]│
├───────────────────────────────┬──────────────┤    ├──────────────────────┤
│ r/popular                     │ Subreddits   │    │ (P)popular (P)pics ▸ │  ← scrollable chips
│ ┌───────────────────────────┐ │ (P) popular  │    ├──────────────────────┤
│ │ ▲  r/sub · u/author · 2h  │ │ (P) pics     │    │ ┌──────────────────┐ │
│ │ 4k Post title             │ │ (W) webdev   │    │ │▲ Post title      │ │
│ │ ▼  [ image ]              │ │ (R) reactjs  │    │ │  [ image ]       │ │
│ │    💬 312 comments Details│ │ …            │    │ │▼ 💬 312  Details │ │
│ └───────────────────────────┘ │              │    │ └──────────────────┘ │
└───────────────────────────────┴──────────────┘    └──────────────────────┘
Clicking a title/image opens a detail modal with the full post and comments.
```

## Features

- **Initial view**: `r/popular` loads on first visit, with skeleton loaders.
- **Search**: typing filters loaded posts instantly; pressing Enter searches all of Reddit (`/search.json`).
- **Categories**: filter by predefined subreddits (sidebar on desktop, chip bar on mobile).
- **Detail view**: accessible modal (focus on open, `Esc` / backdrop to close) with the post and comments.
- **Comments in Markdown** via `react-markdown`.
- **Error states you can leave**: friendly error card with *Try again*, plus a "Go back" for empty searches.
- **Rate-limit aware**: Reddit's free API allows ~10 requests/minute. The client caches responses for 60 s, counts requests in a sliding window and shows a clear "try again in Xs" message on HTTP 429.
- **Offline / demo fallback**: if Reddit is unreachable (network, CORS, blocked), the app switches to built-in demo data and shows a banner instead of breaking.
- **Design system**: CSS custom properties (colors, spacing, radius, shadows), automatic dark mode, animations and transitions that respect `prefers-reduced-motion`.
- **Responsive**: works from 320 px phones to wide desktops.

## Technologies

React 19 · Redux Toolkit 2 (`createSlice`, `createAsyncThunk`, `createSelector`) · react-redux 9 · Vite 8 · react-markdown · Vitest + React Testing Library (unit and integration) · Playwright (end-to-end, desktop and mobile) · Netlify (hosting)

## Project structure

```
src/
  api/          reddit.js (API client, cache, fallback) · rateLimiter.js · mockData.js
  app/          store.js
  features/     posts/ · subreddits/ · comments/   (Redux slices + tests)
  components/   Header · Posts · PostCard · Comments · PostModal · Subreddits
  utils/        format.js (numbers, "x hours ago")
e2e/            Playwright specs
```

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # unit and integration tests (Vitest)
npx playwright test  # end-to-end tests (uses local Chrome)
npm run build        # production build in dist/
```

## Testing

- **Unit**: API client mapping, caching, 429 handling, rate limiter, slice reducers, memoized selectors and formatters.
- **Integration**: the full `<App />` with a real store: feed, live filter, search, category filter, modal, Markdown comments, error and retry, voting.
- **End-to-end**: Playwright on Desktop Chrome and Pixel 7. Reddit responses are intercepted with fixtures, so runs are deterministic and never hit the rate limit.

The original brief asked for Jest and Enzyme. Enzyme has no adapter for React 18 or 19, so the modern equivalent, **Vitest and React Testing Library**, is used instead. It has the same API style (`describe`, `it`, `expect`).

## Future work

- Infinite scroll using Reddit's `after` cursor
- OAuth login to vote and comment for real (the JSON API is read-only)
- Nested comment threads and "load more replies"
- Progressive Web App (offline cache with a service worker)
- CI/CD with GitHub Actions: run tests on every push and deploy `main` automatically
