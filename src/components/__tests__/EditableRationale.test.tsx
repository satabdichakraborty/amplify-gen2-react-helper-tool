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
  default: ({ label, description, children }: any) => (
    <div data-testid="mock-form-field">
      <label>{label}</label>
      <div data-testid="form-field-description">{description}</div>
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
  
  it('applies custom rows value', () => {
    render(<EditableRationale value="" onChange={mockOnChange} rows={10} />);
    
    // TextArea should get the custom rows value
    expect(screen.getByTestId('mock-textarea')).toHaveAttribute('rows', '10');
  });
}); 