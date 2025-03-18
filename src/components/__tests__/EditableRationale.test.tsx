import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { RationaleDisplay } from '../RationaleDisplay';

// Mock the Tabs component from Cloudscape
vi.mock('@cloudscape-design/components/tabs', () => ({
  default: ({ tabs, onChange, activeTabId }: any) => (
    <div data-testid="mock-tabs">
      <div data-testid="tabs-header">
        {tabs.map((tab: any) => (
          <button
            key={tab.id}
            data-testid={`tab-button-${tab.id}`}
            data-active={activeTabId === tab.id}
            onClick={() => onChange({ detail: { activeTabId: tab.id } })}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div data-testid="tab-content">
        {tabs.find((tab: any) => tab.id === activeTabId)?.content}
      </div>
    </div>
  )
}));

// Mock the TextArea component
vi.mock('@cloudscape-design/components/textarea', () => ({
  default: ({ value, onChange, rows }: any) => (
    <textarea
      data-testid="mock-textarea"
      value={value}
      rows={rows}
      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
        onChange({ detail: { value: e.target.value } })}
    />
  )
}));

// Mock the FormField component
vi.mock('@cloudscape-design/components/form-field', () => ({
  default: ({ label, description, children }: any) => (
    <div data-testid="mock-form-field">
      <label>{label}</label>
      <div data-testid="form-field-description">{description}</div>
      {children}
    </div>
  )
}));

// Mock the RationaleDisplay component
vi.mock('../RationaleDisplay', () => ({
  RationaleDisplay: vi.fn(({ text }) => (
    <div data-testid="mock-rationale-display">{text || 'Empty'}</div>
  ))
}));

// Import the component
import { EditableRationale } from '../EditableRationale';

describe('EditableRationale', () => {
  const mockOnChange = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders with default values', () => {
    render(<EditableRationale value="" onChange={mockOnChange} />);
    
    // Should start with editor tab active
    expect(screen.getByTestId('tab-button-editor')).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('tab-button-preview')).toHaveAttribute('data-active', 'false');
    
    // Should show default label and description
    expect(screen.getByText('Explanation')).toBeInTheDocument();
    expect(screen.getByTestId('form-field-description').textContent).toBe(
      'Provide a general explanation for the correct answer and overall context'
    );
    
    // Should render an empty textarea
    expect(screen.getByTestId('mock-textarea')).toHaveValue('');
  });
  
  it('displays custom label and description', () => {
    render(
      <EditableRationale 
        value="" 
        onChange={mockOnChange} 
        label="Custom Label" 
        description="Custom description"
      />
    );
    
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
    expect(screen.getByTestId('form-field-description').textContent).toBe('Custom description');
  });
  
  it('calls onChange when textarea value changes', async () => {
    render(<EditableRationale value="" onChange={mockOnChange} />);
    
    const textarea = screen.getByTestId('mock-textarea');
    
    // Change the value directly instead of using userEvent.type
    fireEvent.change(textarea, { target: { value: 'Test input' } });
    
    // Now the onChange should be called once with the whole string
    expect(mockOnChange).toHaveBeenCalledWith('Test input');
  });
  
  it('switches to preview tab and shows content', async () => {
    render(<EditableRationale value="Test content with https://example.com" onChange={mockOnChange} />);
    
    // Click preview tab
    const previewTab = screen.getByTestId('tab-button-preview');
    fireEvent.click(previewTab);
    
    // Preview tab should now be active
    expect(previewTab).toHaveAttribute('data-active', 'true');
    expect(screen.getByTestId('tab-button-editor')).toHaveAttribute('data-active', 'false');
    
    // RationaleDisplay should be called with the value
    expect(RationaleDisplay).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Test content with https://example.com' }),
      expect.anything()
    );
    
    // The preview should show the content
    expect(screen.getByTestId('mock-rationale-display')).toHaveTextContent('Test content with https://example.com');
  });
  
  it('shows empty state message when preview has no content', async () => {
    render(<EditableRationale value="" onChange={mockOnChange} />);
    
    // Click preview tab
    const previewTab = screen.getByTestId('tab-button-preview');
    fireEvent.click(previewTab);
    
    // Should show empty state message
    expect(screen.getByText('No content to preview')).toBeInTheDocument();
  });
  
  it('applies custom rows value', () => {
    render(<EditableRationale value="" onChange={mockOnChange} rows={10} />);
    
    // TextArea should get the custom rows value
    expect(screen.getByTestId('mock-textarea')).toHaveAttribute('rows', '10');
    
    // Click preview tab to check preview styles
    fireEvent.click(screen.getByTestId('tab-button-preview'));
    
    // Preview container should have a min-height based on rows
    const previewContainer = screen.getByTestId('tab-content').querySelector('div:nth-child(2)') as HTMLElement;
    expect(previewContainer).toHaveStyle('min-height: 240px'); // 10 * 24px
  });
}); 