import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../../App';

// Mock the components
vi.mock('../../components/ItemsList', () => ({
  ItemsList: () => <div data-testid="mock-items-list">ItemsList Component</div>
}));

vi.mock('../../components/CreateEditItem', () => ({
  CreateEditItem: () => <div data-testid="mock-create-edit-item">CreateEditItem Component</div>
}));

vi.mock('../../components/Footer', () => ({
  Footer: () => <div data-testid="mock-footer">Footer Component</div>
}));

// Mock the react-router-dom 
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: any) => <div data-testid="mock-router">{children}</div>,
    Routes: ({ children }: any) => <div data-testid="mock-routes">{children}</div>,
    Route: ({ path, element }: any) => (
      <div data-testid={`mock-route-${path?.replace(/\//g, '-') || 'default'}`}>
        {element}
      </div>
    )
  };
});

describe('App', () => {
  it('renders the app with router and footer', () => {
    render(<App />);
    
    // Check that router is rendered
    expect(screen.getByTestId('mock-router')).toBeInTheDocument();
    
    // Check that routes are rendered
    expect(screen.getByTestId('mock-routes')).toBeInTheDocument();
    
    // Check that the route paths are rendered
    expect(screen.getByTestId('mock-route--')).toBeInTheDocument(); // root path
    expect(screen.getByTestId('mock-route--items')).toBeInTheDocument();
    expect(screen.getByTestId('mock-route--items-new')).toBeInTheDocument();
    expect(screen.getByTestId('mock-route--items-:id-edit')).toBeInTheDocument();
    
    // Check that the footer is rendered
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
  });
}); 