import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { setupStore } from '../app/store';

// Render a component with its own fresh Redux store.
export function renderWithStore(ui, { preloadedState, store = setupStore(preloadedState) } = {}) {
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

// Make fetch fail like an offline / CORS-blocked request.
export const offlineFetch = () => Promise.reject(new TypeError('Failed to fetch'));

// Build a fake Reddit Listing response.
export const listing = (items) => ({
  ok: true,
  status: 200,
  headers: { get: () => null },
  json: async () => ({ data: { children: items.map((data) => ({ kind: 't3', data })) } }),
});
