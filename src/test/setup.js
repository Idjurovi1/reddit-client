import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import { _resetForTests } from '../api/reddit';

beforeEach(() => _resetForTests());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
