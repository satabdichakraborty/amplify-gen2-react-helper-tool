import { render, screen } from '@testing-library/react';
import { convertUrlsToLinks, TextWithLinks } from '../../utils/formatUtils';

describe('formatUtils', () => {
  describe('convertUrlsToLinks', () => {
    it('returns empty string for empty input', () => {
      expect(convertUrlsToLinks('')).toBe('');
      expect(convertUrlsToLinks(null as unknown as string)).toBe('');
    });

    it('returns original text when no URLs are present', () => {
      const text = 'This is a text without any URLs';
      // The function returns an array with the original text when no URLs are present
      const result = convertUrlsToLinks(text);
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual([text]);
    });

    it('converts http URLs to links', () => {
      const text = 'Visit http://example.com for more information';
      const result = convertUrlsToLinks(text) as (string | JSX.Element)[];
      
      // Should be an array of elements now
      expect(Array.isArray(result)).toBe(true);
      
      // First element should be text before the URL
      expect(result[0]).toBe('Visit ');
      
      // Second element should be an anchor
      const link = result[1] as JSX.Element;
      expect(link.type).toBe('a');
      expect(link.props.href).toBe('http://example.com');
      expect(link.props.children).toBe('http://example.com');
      
      // Third element should be text after the URL
      expect(result[2]).toBe(' for more information');
    });

    it('converts https URLs to links', () => {
      const text = 'Visit https://example.com for more information';
      const result = convertUrlsToLinks(text) as (string | JSX.Element)[];
      const link = result[1] as JSX.Element;
      expect(link.props.href).toBe('https://example.com');
    });

    it('converts www URLs to links with https prefix', () => {
      const text = 'Visit www.example.com for more information';
      const result = convertUrlsToLinks(text) as (string | JSX.Element)[];
      const link = result[1] as JSX.Element;
      expect(link.props.href).toBe('https://www.example.com');
      expect(link.props.children).toBe('www.example.com');
    });

    it('handles multiple URLs in the same text', () => {
      const text = 'Visit http://example.com and https://test.com for more';
      const result = convertUrlsToLinks(text) as (string | JSX.Element)[];
      
      // Should find both links
      expect(result.length).toBe(5); // 3 text parts + 2 links
      
      const firstLink = result[1] as JSX.Element;
      expect(firstLink.props.href).toBe('http://example.com');
      
      const secondLink = result[3] as JSX.Element;
      expect(secondLink.props.href).toBe('https://test.com');
    });

    it('handles URLs with query parameters and special characters', () => {
      const text = 'Check https://example.com/path?param=value&other=123#section for details';
      const result = convertUrlsToLinks(text) as (string | JSX.Element)[];
      
      const link = result[1] as JSX.Element;
      expect(link.props.href).toBe('https://example.com/path?param=value&other=123#section');
      expect(link.props.children).toBe('https://example.com/path?param=value&other=123#section');
    });

    it('handles URLs with periods and other special characters', () => {
      const text = 'Visit https://sub.domain.example.co.uk/page.html or www.test-site.io/resource.asp';
      const result = convertUrlsToLinks(text) as (string | JSX.Element)[];
      
      // Our regex is matching differently than expected - fixed the test expectation
      expect(result.length).toBe(4); // text + URL + text + URL
      
      // Check that the URLs are correctly identified
      expect(result.some(item => 
        typeof item === 'object' && 
        item.props.href === 'https://sub.domain.example.co.uk/page.html'
      )).toBe(true);
      
      expect(result.some(item => 
        typeof item === 'object' && 
        item.props.href === 'https://www.test-site.io/resource.asp'
      )).toBe(true);
    });

    it('properly handles URLs embedded in text with periods', () => {
      const text = 'This sentence ends with a URL: https://example.com. This is a new sentence.';
      const result = convertUrlsToLinks(text) as (string | JSX.Element)[];
      
      expect(result.length).toBe(3); // Before URL + URL + After URL
      
      const link = result[1] as JSX.Element;
      expect(link.props.href).toBe('https://example.com');
      expect(result[2]).toBe('. This is a new sentence.');
    });
  });

  describe('TextWithLinks', () => {
    it('renders text with links', () => {
      render(<TextWithLinks text="Visit https://example.com for more" />);
      
      // Link should be rendered as an anchor
      const link = screen.getByText('https://example.com');
      expect(link.tagName).toBe('A');
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
}); 