import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock window.location
delete window.location;
window.location = {
  href: '',
  pathname: '/',
  search: '',
  hash: '',
  origin: 'http://localhost:3000',
  assign: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
};

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
  localStorage.getItem.mockReturnValue(null);
});
