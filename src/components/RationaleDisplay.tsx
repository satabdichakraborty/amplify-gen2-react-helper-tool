import * as React from 'react';
import { convertUrlsToLinks } from '../utils/formatUtils';

interface RationaleDisplayProps {
  text: string;
  maxHeight?: string;
  className?: string;
}

/**
 * RationaleDisplay renders rationale text with clickable links
 * It preserves whitespace, line breaks, and special characters from the original text
 * URLs are automatically converted to clickable links
 */
export const RationaleDisplay: React.FC<RationaleDisplayProps> = ({ text, maxHeight, className }) => {
  if (!text) return null;
  
  return (
    <div 
      className={className}
      style={{ 
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        maxHeight: maxHeight || 'none',
        overflowY: maxHeight ? 'auto' : 'visible',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        lineHeight: '1.5',
        padding: '8px 0',
      }}
    >
      {convertUrlsToLinks(text)}
    </div>
  );
} 