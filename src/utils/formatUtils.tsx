import * as React from 'react';

/**
 * Converts URLs in text to clickable links
 * @param text The text that may contain URLs
 * @returns An array of React elements and strings
 */
export function convertUrlsToLinks(text: string): React.ReactNode {
  if (!text) return '';
  
  // Enhanced regular expression to match URLs
  // This matches most common URL formats including:
  // - http, https, ftp protocols
  // - URLs starting with www.
  // - Support for query parameters, fragments, paths with special chars
  // - Support for various TLDs
  const urlRegex = /(\b(?:https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|]|\bwww\.[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  
  // Find all URLs in the text
  while ((match = urlRegex.exec(text)) !== null) {
    // Add the text before the URL
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Format the URL properly - ensure it has a protocol
    let url = match[0];
    const displayUrl = url;
    if (url.startsWith('www.')) {
      url = 'https://' + url;
    }
    
    // Add the URL as a link
    parts.push(
      <a 
        key={match.index} 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ color: '#0073bb', textDecoration: 'underline' }}
      >
        {displayUrl}
      </a>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length ? parts : text;
}

/**
 * Safely renders text that may contain URLs as clickable links
 * @param text The text that may contain URLs
 * @returns A React component that renders the text with clickable links
 */
export function TextWithLinks({ text }: { text: string }) {
  return <div>{convertUrlsToLinks(text)}</div>;
} 