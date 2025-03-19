import { render, screen } from '@testing-library/react';
import { Footer } from '../Footer';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the Cloudscape components to avoid unmounting issues
vi.mock('@cloudscape-design/components', () => ({
  Box: ({ children }: any) => <div data-testid="mock-box">{children}</div>,
  TextContent: ({ children }: any) => <div data-testid="mock-text-content">{children}</div>
}));

describe('Footer', () => {
  const originalEnv = { ...import.meta.env };
  
  beforeEach(() => {
    // Reset the environment before each test
    vi.resetModules();
    Object.defineProperty(import.meta, 'env', {
      value: { ...originalEnv },
      writable: true
    });
  });
  
  it('renders with current date when no build time is provided', () => {
    // Mock the current date
    const mockDate = new Date('2023-06-15T12:00:00Z');
    const dateSpy = vi.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    render(<Footer />);
    
    // Check that the footer contains the expected text
    expect(screen.getByText(/Last deployed:/)).toBeInTheDocument();
    
    // Clean up the date mock
    dateSpy.mockRestore();
  });
  
  it('renders with the provided build time from environment variable', () => {
    // Set up mock environment variable
    const buildTime = '2023-05-10T14:30:00Z';
    Object.defineProperty(import.meta, 'env', {
      value: { ...originalEnv, VITE_BUILD_TIME: buildTime },
      writable: true
    });
    
    // Mock Date to return consistent values
    const mockDate = vi.spyOn(Date.prototype, 'toLocaleString');
    mockDate.mockReturnValue('Mocked Date String');
    
    render(<Footer />);
    
    // Check that the footer contains the expected build time
    expect(screen.getByText(/Last deployed:/)).toBeInTheDocument();
    expect(screen.getByText(/Last deployed: Mocked Date String/)).toBeInTheDocument();
    
    // Clean up
    mockDate.mockRestore();
  });
}); 