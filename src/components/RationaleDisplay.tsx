import * as React from 'react';
import { convertUrlsToLinks } from '../utils/formatUtils';

interface RationaleDisplayProps {
  text: string;
  maxHeight?: string;
  className?: string;
}

/**
 * RationaleDisplay renders rationale text with clickable links
 * It preserves whitespace and line breaks from the original text
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
      }}
    >
      {convertUrlsToLinks(text)}
    </div>
  );
} 