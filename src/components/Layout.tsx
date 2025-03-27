import React, { useState, useEffect } from 'react';
import { SideNavigation } from './SideNavigation';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  
  // Function to handle navigation toggle event from SideNavigation
  const handleNavToggle = (collapsed: boolean) => {
    setIsNavCollapsed(collapsed);
  };
  
  // Set up a listener for screen size changes to automatically collapse nav on small screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsNavCollapsed(true);
      }
    };
    
    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  return (
    <div className="app-container">
      <SideNavigation onToggle={handleNavToggle} initialCollapsed={isNavCollapsed} />
      <div className={`main-content ${isNavCollapsed ? 'with-collapsed-nav' : ''}`}>
        {children}
        <Footer />
      </div>
    </div>
  );
}; 