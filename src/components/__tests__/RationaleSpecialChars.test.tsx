import { render, screen } from '@testing-library/react';
import { RationaleDisplay } from '../RationaleDisplay';
import { vi } from 'vitest';
import { convertUrlsToLinks } from '../../utils/formatUtils';

// Use the actual implementation for these tests
vi.unmock('../../utils/formatUtils');

describe('RationaleDisplay with Special Characters', () => {
  it('renders text with periods correctly', () => {
    const text = 'This is a sentence with a period. This is another sentence.';
    const { container } = render(<RationaleDisplay text={text} />);
    expect(container.textContent).toBe(text);
  });

  it('renders text with special characters correctly', () => {
    const text = 'Special chars: !@#$%^&*()_+-=[]{}|;:\'",.<>/?`~';
    const { container } = render(<RationaleDisplay text={text} />);
    expect(container.textContent).toBe(text);
  });

  it('renders URLs correctly and makes them clickable', () => {
    const text = 'Check out https://example.com for more info';
    render(<RationaleDisplay text={text} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('handles URLs with query parameters correctly', () => {
    const text = 'Visit https://example.com/path?param=value&query=123';
    render(<RationaleDisplay text={text} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://example.com/path?param=value&query=123');
  });

  it('handles multiple URLs in the same text', () => {
    const text = 'Check https://example.com and also visit http://test.org';
    render(<RationaleDisplay text={text} />);
    
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    expect(links[0]).toHaveAttribute('href', 'https://example.com');
    expect(links[1]).toHaveAttribute('href', 'http://test.org');
  });

  it('preserves line breaks in text', () => {
    const text = 'Line 1\nLine 2\nLine 3';
    const { container } = render(<RationaleDisplay text={text} />);
    
    // Check that the style has white-space: pre-wrap
    const div = container.firstChild as HTMLElement;
    expect(div).toHaveStyle({ whiteSpace: 'pre-wrap' });
    
    // Content should be preserved exactly
    expect(container.textContent).toBe(text);
  });

  it('renders AWS documentation URLs correctly', () => {
    const text = 'See AWS docs at https://docs.aws.amazon.com/lambda/latest/dg/welcome.html';
    render(<RationaleDisplay text={text} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://docs.aws.amazon.com/lambda/latest/dg/welcome.html');
  });
}); 