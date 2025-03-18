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
  
  it('renders with default values', () => {
    render(<EditableRationale value="" onChange={mockOnChange} />);
    
    // Should show default label
    expect(screen.getByText('Explanation')).toBeInTheDocument();
    
    // Should render an empty textarea
    expect(screen.getByTestId('mock-textarea')).toHaveValue('');
  });
  
  it('displays custom label', () => {
    render(
      <EditableRationale 
        value="" 
        onChange={mockOnChange} 
        label="Custom Label" 
      />
    );
    
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });
  
  it('calls onChange when textarea value changes', async () => {
    render(<EditableRationale value="" onChange={mockOnChange} />);
    
    const textarea = screen.getByTestId('mock-textarea');
    
    // Change the value directly instead of using userEvent.type
    fireEvent.change(textarea, { target: { value: 'Test input' } });
    
    // Now the onChange should be called once with the whole string
    expect(mockOnChange).toHaveBeenCalledWith('Test input');
  });
  
  it('applies custom rows value', () => {
    render(<EditableRationale value="" onChange={mockOnChange} rows={10} />);
    
    // TextArea should get the custom rows value
    expect(screen.getByTestId('mock-textarea')).toHaveAttribute('rows', '10');
  });
}); 