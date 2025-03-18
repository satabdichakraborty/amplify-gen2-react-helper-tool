import { render, screen } from '@testing-library/react';
import { RationaleDisplay } from '../RationaleDisplay';
import { convertUrlsToLinks } from '../../utils/formatUtils';
import { vi } from 'vitest';

// Mock the formatUtils module
vi.mock('../../utils/formatUtils', () => ({
  convertUrlsToLinks: vi.fn((text) => `Processed: ${text}`)
}));

describe('RationaleDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders text and applies convertUrlsToLinks', () => {
    render(<RationaleDisplay text="Test text with https://example.com link" />);
    expect(convertUrlsToLinks).toHaveBeenCalledWith("Test text with https://example.com link");
    expect(screen.getByText('Processed: Test text with https://example.com link')).toBeInTheDocument();
  });

  it('returns null for empty text', () => {
    const { container } = render(<RationaleDisplay text="" />);
    expect(container.firstChild).toBeNull();
    expect(convertUrlsToLinks).not.toHaveBeenCalled();
  });

  it('applies maxHeight style when provided', () => {
    const { container } = render(<RationaleDisplay text="Some text" maxHeight="200px" />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveStyle({ maxHeight: '200px', overflowY: 'auto' });
  });

  it('uses default values for maxHeight when not provided', () => {
    const { container } = render(<RationaleDisplay text="Some text" />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveStyle({ maxHeight: 'none', overflowY: 'visible' });
  });

  it('applies custom className when provided', () => {
    const { container } = render(<RationaleDisplay text="Some text" className="custom-class" />);
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveClass('custom-class');
  });
}); 