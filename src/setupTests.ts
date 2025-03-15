import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers as any);

// Mock Amplify
vi.mock('aws-amplify', () => ({
  Amplify: {
    configure: vi.fn()
  }
}));

// Mock ReactDOM
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn()
  }))
}));

// Mock the Amplify client
vi.mock('@aws-amplify/api', () => ({
  generateClient: vi.fn(() => ({
    models: {
      Item: {
        create: vi.fn(),
        update: vi.fn(),
        get: vi.fn(),
        list: vi.fn()
      }
    }
  }))
}));

// Set up DOM element for React 18
beforeAll(() => {
  const div = document.createElement('div');
  div.id = 'root';
  document.body.appendChild(div);
});

// Cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
}); 