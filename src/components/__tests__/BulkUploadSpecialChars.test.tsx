import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BulkUpload } from '../BulkUpload';
import { vi } from 'vitest';
import { createItem } from '../../graphql/operations';

// Mock the operations
vi.mock('../../graphql/operations', () => ({
  createItem: vi.fn().mockResolvedValue({
    data: {
      createItem: {
        ID: '123',
        CreatedDate: '2023-01-01',
        Question: 'Test question',
        Type: 'Multiple Choice',
        Status: 'Active',
        CreatedBy: 'system'
      }
    }
  })
}));

describe('BulkUpload with Special Characters', () => {
  const mockOnDismiss = vi.fn();
  const mockOnUploadComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles URLs in rationale fields', async () => {
    render(
      <BulkUpload
        visible={true}
        onDismiss={mockOnDismiss}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    // Create a CSV file with URLs in rationale fields
    const csvContent = `QuestionId,CreatedDate,Question,Type,Status,responseA,responseB,responseC,responseD,rationaleA,rationaleB,rationaleC,rationaleD,Key,Rationale
123,2023-01-01,Test question with URLs,Multiple Choice,Active,Option A,Option B,Option C,Option D,See https://example.com for more details,Learn more at https://docs.aws.amazon.com/lambda,Check out http://test.org/page.html?param=value,Visit www.example.org,A,For more information visit https://aws.amazon.com/documentation/`;
    
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    // Add toString method for tests
    Object.defineProperty(file, 'toString', {
      value: function() { return csvContent; }
    });
    
    // Select the file
    const fileInput = screen.getByLabelText('Choose file');
    await userEvent.upload(fileInput, file);
    
    // Click upload button
    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    await userEvent.click(uploadButton);
    
    // Verify createItem was called with the correct data including URLs
    await waitFor(() => {
      expect(createItem).toHaveBeenCalledWith(expect.objectContaining({
        QuestionId: 123,
        Question: 'Test question with URLs',
        rationaleA: 'See https://example.com for more details',
        rationaleB: 'Learn more at https://docs.aws.amazon.com/lambda',
        rationaleC: 'Check out http://test.org/page.html?param=value',
        rationaleD: 'Visit www.example.org',
        Rationale: 'For more information visit https://aws.amazon.com/documentation/'
      }));
    });
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/Successfully uploaded 1 items/i)).toBeInTheDocument();
      expect(mockOnUploadComplete).toHaveBeenCalled();
    });
  });

  it('handles special characters in rationale fields', async () => {
    render(
      <BulkUpload
        visible={true}
        onDismiss={mockOnDismiss}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    // Create a CSV file with special characters in rationale fields
    // Note: In CSV format, we can't easily include newlines in fields, so using a single line rationale
    const csvContent = `QuestionId,CreatedDate,Question,Type,Status,responseA,responseB,responseC,responseD,rationaleA,rationaleB,rationaleC,rationaleD,Key,Rationale
123,2023-01-01,Test question with special chars,Multiple Choice,Active,Option A,Option B,Option C,Option D,"Special chars: !@#$%^&*()_+-=[]{}|;:',.<>/?","Punctuation: period. comma, semicolon; colon:","Quotes: 'single' and ""double""","Parentheses and brackets: (test) [example]",A,"This is a multi-line rationale with special characters: !@#$%^&*() and URLs: https://example.com"`;
    
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' });
    
    // Add toString method for tests
    Object.defineProperty(file, 'toString', {
      value: function() { return csvContent; }
    });
    
    // Select the file
    const fileInput = screen.getByLabelText('Choose file');
    await userEvent.upload(fileInput, file);
    
    // Click upload button
    const uploadButton = screen.getByRole('button', { name: /Upload/i });
    await userEvent.click(uploadButton);
    
    // Verify createItem was called with the correct data including special characters
    await waitFor(() => {
      expect(createItem).toHaveBeenCalledWith(expect.objectContaining({
        QuestionId: 123,
        Question: 'Test question with special chars',
        rationaleA: "Special chars: !@#$%^&*()_+-=[]{}|;:',.<>/?",
        rationaleB: 'Punctuation: period. comma, semicolon; colon:',
        rationaleC: 'Quotes: \'single\' and "double"',
        rationaleD: 'Parentheses and brackets: (test) [example]',
        Rationale: 'This is a multi-line rationale with special characters: !@#$%^&*() and URLs: https://example.com'
      }));
    });
    
    // Verify success message
    await waitFor(() => {
      expect(screen.getByText(/Successfully uploaded 1 items/i)).toBeInTheDocument();
      expect(mockOnUploadComplete).toHaveBeenCalled();
    });
  });
}); 