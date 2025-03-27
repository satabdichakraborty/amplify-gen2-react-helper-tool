import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/SideNavigation.css';

interface SideNavigationProps {
  onToggle?: (collapsed: boolean) => void;
  initialCollapsed?: boolean;
}

export const SideNavigation: React.FC<SideNavigationProps> = ({ 
  onToggle,
  initialCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  
  // Update internal state if initialCollapsed prop changes
  useEffect(() => {
    setIsCollapsed(initialCollapsed);
  }, [initialCollapsed]);
  
  const toggleNav = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    
    // Notify parent component if callback is provided
    if (onToggle) {
      onToggle(newCollapsedState);
    }
  };
  
  return (
    <div className={`side-navigation ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="nav-header">
        <h2>Amplify Tools</h2>
        <button 
          className="toggle-button" 
          onClick={toggleNav}
          aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {isCollapsed ? '›' : '‹'}
        </button>
      </div>
      
      <nav className="nav-links">
        <div className="nav-section">
          <h3>Question Management</h3>
          <ul>
            <li>
              <NavLink to="/" end>
                <span className="nav-icon">📋</span>
                <span className="nav-text">Items List</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/items/new">
                <span className="nav-icon">➕</span>
                <span className="nav-text">Create New Item</span>
              </NavLink>
            </li>
          </ul>
        </div>
        
        <div className="nav-section">
          <h3>Utilities</h3>
          <ul>
            <li>
              <NavLink to="/utilities/question-formatter">
                <span className="nav-icon">🔧</span>
                <span className="nav-text">Question Formatter</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/utilities/prompt-management">
                <span className="nav-icon">📝</span>
                <span className="nav-text">Prompt Management</span>
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
      
      <div className="nav-footer">
        <p>Amplify Gen2 Helper</p>
      </div>
    </div>
  );
}; 