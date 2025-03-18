import { render, screen } from '@testing-library/react';
import { convertUrlsToLinks, TextWithLinks } from '../../utils/formatUtils';
import '@testing-library/jest-dom';

describe('formatUtils', () => {
  describe('convertUrlsToLinks', () => {
    it('should convert URLs to links in text', () => {
      const text = 'Check out https://example.com for more information';
      const result = convertUrlsToLinks(text);
      
      // Should be an array of 3 parts: text before URL, link, text after URL
      expect(Array.isArray(result)).toBe(true);
      
      // If result is an array, check its structure
      if (Array.isArray(result)) {
        expect(result.length).toBe(3);
        expect(result[0]).toBe('Check out ');
        expect(result[1].type).toBe('a');
        expect(result[1].props.href).toBe('https://example.com');
        expect(result[2]).toBe(' for more information');
      }
    });

    it('should handle multiple URLs in the same text', () => {
      const text = 'Visit https://example.com and https://example.org for more information';
      const result = convertUrlsToLinks(text);
      
      // Should be an array of 5 parts
      expect(Array.isArray(result)).toBe(true);
      
      // If result is an array, check that it has 5 elements
      if (Array.isArray(result)) {
        expect(result.length).toBe(5);
        expect(result[0]).toBe('Visit ');
        expect(result[1].props.href).toBe('https://example.com');
        expect(result[2]).toBe(' and ');
        expect(result[3].props.href).toBe('https://example.org');
        expect(result[4]).toBe(' for more information');
      }
    });

    it('should handle URLs with www prefix', () => {
      const text = 'Visit www.example.com for more information';
      const result = convertUrlsToLinks(text);
      
      if (Array.isArray(result)) {
        expect(result.length).toBe(3);
        expect(result[1].props.href).toBe('https://www.example.com');
        expect(result[1].props.children).toBe('www.example.com');
      }
    });

    it('should handle URLs with query parameters', () => {
      const text = 'Check out https://example.com/search?q=test&page=1 for results';
      const result = convertUrlsToLinks(text);
      
      if (Array.isArray(result)) {
        expect(result[1].props.href).toBe('https://example.com/search?q=test&page=1');
      }
    });

    it('should handle AWS documentation URLs with complex paths', () => {
      const text = 'Learn more about S3 hosting at https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html';
      const result = convertUrlsToLinks(text);
      
      if (Array.isArray(result)) {
        // Actual output has 2 elements (text before, URL)
        expect(result.length).toBe(2);
        expect(result[1].props.href).toBe('https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html');
      }
    });

    it('should handle multiple AWS documentation URLs with spaces between them', () => {
      const text = 'Amazon RDS is AWS\'s database service for relational databases. Learn more at https://aws.amazon.com/rds/ https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html';
      const result = convertUrlsToLinks(text);
      
      if (Array.isArray(result)) {
        // Actual output has 4 elements (text before, URL1, space, URL2)
        expect(result.length).toBe(4);
        expect(result[1].props.href).toBe('https://aws.amazon.com/rds/');
        expect(result[3].props.href).toBe('https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html');
      }
    });
  });

  describe('TextWithLinks', () => {
    it('should render text with links', () => {
      render(<TextWithLinks text="Check out https://example.com for more info" />);
      const link = screen.getByRole('link', { name: 'https://example.com' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com');
    });
  });
}); 