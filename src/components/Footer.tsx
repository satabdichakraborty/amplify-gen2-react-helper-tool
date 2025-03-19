import { Box, TextContent } from '@cloudscape-design/components';
import { useEffect, useState } from 'react';

export function Footer() {
  const [buildTime, setBuildTime] = useState<string>('');
  
  useEffect(() => {
    // Get the build time from environment variable or use current time as fallback
    const deployTime = import.meta.env.VITE_BUILD_TIME 
      ? new Date(import.meta.env.VITE_BUILD_TIME).toLocaleString()
      : new Date().toLocaleString();
      
    setBuildTime(deployTime);
  }, []);

  return (
    <Box margin={{ top: 'l', bottom: 'xs' }} padding={{ top: 's' }}>
      <div style={{ borderTop: '1px solid #e9ebed', paddingTop: '12px', textAlign: 'center' }}>
        <TextContent>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>
            Last deployed: {buildTime}
          </div>
        </TextContent>
      </div>
    </Box>
  );
} 