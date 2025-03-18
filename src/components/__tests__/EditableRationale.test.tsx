import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';

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
  default: ({ label, children }: any) => (
    <div data-testid="mock-form-field">
      <label>{label}</label>
      {children}
    </div>
  )
}));

// Import the component
import { EditableRationale } from '../EditableRationale';

describe('EditableRationale', () => {
  const mockOnChange = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders with default props', () => {
    render(<EditableRationale value="" onChange={mockOnChange} />);
    
    // Check for the default label
    expect(screen.getByText('Explanation')).toBeInTheDocument();
    
    // Check if the textarea is rendered
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });
  
  it('passes custom props correctly', () => {
    render(
      <EditableRationale 
        value="Test value" 
        onChange={mockOnChange}
        label="Custom Label"
        rows={8}
      />
    );
    
    // Check custom label
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
    
    // Check if value is set correctly
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('Test value');
  });
  
  it('calls onChange when text changes', () => {
    render(<EditableRationale value="" onChange={mockOnChange} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New value' } });
    
    expect(mockOnChange).toHaveBeenCalledWith('New value');
  });
  
  it('applies custom rows prop', () => {
    render(<EditableRationale value="" onChange={mockOnChange} rows={10} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '10');
  });
  
  it('handles special characters correctly', () => {
    const textWithSpecialChars = 'Text with special chars: !@#$%^&*().,;:\'"/\\';
    render(<EditableRationale value={textWithSpecialChars} onChange={mockOnChange} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(textWithSpecialChars);
  });
  
  it('preserves URLs in textarea value', () => {
    const textWithUrl = 'Check this link: https://example.com/path?query=value#fragment';
    render(<EditableRationale value={textWithUrl} onChange={mockOnChange} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(textWithUrl);
  });
  
  it('handles multiline text with special characters', () => {
    const multilineText = 'First line\nSecond line with URL: https://example.com\nThird line with symbols: !@#$%^&*()';
    render(<EditableRationale value={multilineText} onChange={mockOnChange} />);
    
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue(multilineText);
  });
}); 