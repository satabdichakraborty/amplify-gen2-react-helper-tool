import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { BulkUpload } from '../BulkUpload';
import { createItem } from '../../graphql/operations';

// Mock the createItem function
vi.mock('../../graphql/operations', () => ({
  createItem: vi.fn().mockResolvedValue({
    QuestionId: 123,
    CreatedDate: '2023-01-01',
    Question: 'Test question',
    Type: 'MCQ',
    Status: 'Active'
  })
}));

describe('BulkUpload', () => {
  const mockOnDismiss = vi.fn();
  const mockOnUploadComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload form', () => {
    render(
      <BulkUpload
        visible={true}
        onDismiss={mockOnDismiss}
        onUploadComplete={mockOnUploadComplete}
      />
    );
    
    expect(screen.getByText('Upload Items')).toBeInTheDocument();
    expect(screen.getByText('Select CSV file')).toBeInTheDocument();
  });

  it('handles valid CSV upload with Key field', async () => {
    render(
      <BulkUpload
        visible={true}
        onDismiss={mockOnDismiss}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    // Create a test CSV file with Key field
    const csvContent = `QuestionId,CreatedDate,Question,Type,Status,responseA,responseB,responseC,responseD,rationaleA,rationaleB,rationaleC,rationaleD,Key,Rationale
123,2023-01-01,Test question,MCQ,Active,Option A,Option B,Option C,Option D,Rationale A,Rationale B,Rationale C,Rationale D,A,Additional rationale`;
    
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
    
    // Verify createItem was called with correct data
    await waitFor(() => {
      expect(createItem).toHaveBeenCalledWith(expect.objectContaining({
        QuestionId: 123,
        CreatedDate: '2023-01-01',
        Question: 'Test question',
        Type: 'MCQ',
        Status: 'Active',
        responseA: 'Option A',
        responseB: 'Option B',
        responseC: 'Option C',
        responseD: 'Option D',
        rationaleA: 'Rationale A',
        rationaleB: 'Rationale B',
        rationaleC: 'Rationale C',
        rationaleD: 'Rationale D',
        Key: 'A',
        Rationale: 'Additional rationale'
      }));
    });
    
    // Verify success message and callback
    await waitFor(() => {
      expect(screen.getByText(/Successfully uploaded 1 item/i)).toBeInTheDocument();
      expect(mockOnUploadComplete).toHaveBeenCalled();
    });
  });

  it('handles valid CSV upload with Rationale for backward compatibility', async () => {
    render(
      <BulkUpload
        visible={true}
        onDismiss={mockOnDismiss}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    // Create a test CSV file with only Rationale field (no Key)
    const csvContent = `QuestionId,CreatedDate,Question,Type,Status,responseA,responseB,responseC,responseD,rationaleA,rationaleB,rationaleC,rationaleD,Rationale
123,2023-01-01,Test question,MCQ,Active,Option A,Option B,Option C,Option D,Rationale A,Rationale B,Rationale C,Rationale D,A`;
    
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
    
    // Verify createItem was called with correct data
    await waitFor(() => {
      expect(createItem).toHaveBeenCalledWith(expect.objectContaining({
        QuestionId: 123,
        CreatedDate: '2023-01-01',
        Question: 'Test question',
        Type: 'MCQ',
        Status: 'Active',
        responseA: 'Option A',
        responseB: 'Option B',
        responseC: 'Option C',
        responseD: 'Option D',
        rationaleA: 'Rationale A',
        rationaleB: 'Rationale B',
        rationaleC: 'Rationale C',
        rationaleD: 'Rationale D',
        Key: 'A',
        Rationale: 'A'
      }));
    });
    
    // Verify success message and callback
    await waitFor(() => {
      expect(screen.getByText(/Successfully uploaded 1 item/i)).toBeInTheDocument();
      expect(mockOnUploadComplete).toHaveBeenCalled();
    });
  });

  it('handles invalid CSV format', async () => {
    render(
      <BulkUpload
        visible={true}
        onDismiss={mockOnDismiss}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    // Create an invalid CSV file (missing required fields)
    const csvContent = `QuestionId,Type,Question,responseA,responseB,responseC,responseD,rationaleA,rationaleB,rationaleC,rationaleD
123,MCQ,Test question,Option A,Option B,Option C,Option D,Rationale A,Rationale B,Rationale C,Rationale D`;
    
    const file = new File([csvContent], 'invalid.csv', { type: 'text/csv' });
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
    
    // Verify error message
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Missing required headers: CreatedDate');
      expect(alert).toHaveTextContent('Actual Headers:');
      expect(alert).toHaveTextContent('Expected Headers:');
    });
  });

  it('handles API errors', async () => {
    // Mock API error
    vi.mocked(createItem).mockRejectedValueOnce(new Error('API Error'));
    
    render(
      <BulkUpload
        visible={true}
        onDismiss={mockOnDismiss}
        onUploadComplete={mockOnUploadComplete}
      />
    );
    
    // Create a test CSV file
    const csvContent = `QuestionId,CreatedDate,Question,Type,Status,responseA,responseB,responseC,responseD,rationaleA,rationaleB,rationaleC,rationaleD,Key
123,2023-01-01,Test question,MCQ,Active,Option A,Option B,Option C,Option D,Rationale A,Rationale B,Rationale C,Rationale D,A`;
    
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
    
    // Verify error message
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Failed to upload any items. First error: Row 1: API Error');
    });
  });

  it('handles cancel button', async () => {
    render(
      <BulkUpload
        visible={true}
        onDismiss={mockOnDismiss}
        onUploadComplete={mockOnUploadComplete}
      />
    );
    
    // Click cancel button
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await userEvent.click(cancelButton);
    
    // Verify onDismiss was called
    expect(mockOnDismiss).toHaveBeenCalled();
  });

  it('handles invalid Key format', async () => {
    render(
      <BulkUpload
        visible={true}
        onDismiss={mockOnDismiss}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    // Create a CSV file with invalid Key
    const csvContent = `QuestionId,CreatedDate,Question,Type,Status,responseA,responseB,responseC,responseD,rationaleA,rationaleB,rationaleC,rationaleD,Key
123,2023-01-01,Test question,MCQ,Active,Option A,Option B,Option C,Option D,Rationale A,Rationale B,Rationale C,Rationale D,X`;
    
    const file = new File([csvContent], 'invalid.csv', { type: 'text/csv' });
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
    
    // Verify error message
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Row 1: Key must be a single character (A-H) representing the correct answer');
    });
  });

  it('handles case-insensitive CSV headers', async () => {
    render(
      <BulkUpload
        visible={true}
        onDismiss={mockOnDismiss}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    // Create a test CSV file with mixed case headers
    const csvContent = `questionid,createddate,question,type,status,responsea,responseb,responsec,responsed,rationalea,rationaleb,rationalec,rationaled,key,rationale
123,2023-01-01,Test question,MCQ,Active,Option A,Option B,Option C,Option D,Rationale A,Rationale B,Rationale C,Rationale D,A,Additional rationale`;
    
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
    
    // Verify createItem was called with correct data
    await waitFor(() => {
      expect(createItem).toHaveBeenCalledWith(expect.objectContaining({
        QuestionId: 123,
        CreatedDate: '2023-01-01',
        Question: 'Test question',
        Type: 'MCQ',
        Status: 'Active',
        responseA: 'Option A',
        responseB: 'Option B',
        responseC: 'Option C',
        responseD: 'Option D',
        rationaleA: 'Rationale A',
        rationaleB: 'Rationale B',
        rationaleC: 'Rationale C',
        rationaleD: 'Rationale D',
        Key: 'A',
        Rationale: 'Additional rationale'
      }));
    });
    
    // Verify success message and callback
    await waitFor(() => {
      expect(screen.getByText(/Successfully uploaded 1 item/i)).toBeInTheDocument();
      expect(mockOnUploadComplete).toHaveBeenCalled();
    });
  });

  it('handles CSV upload with responses G and H', async () => {
    render(
      <BulkUpload
        visible={true}
        onDismiss={mockOnDismiss}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    // Create a test CSV file with all responses A-H
    const csvContent = `QuestionId,CreatedDate,Question,Type,Status,responseA,responseB,responseC,responseD,responseE,responseF,responseG,responseH,rationaleA,rationaleB,rationaleC,rationaleD,rationaleE,rationaleF,rationaleG,rationaleH,Key,Rationale
123,2023-01-01,Test question with 8 options,MCQ,Active,Option A,Option B,Option C,Option D,Option E,Option F,Option G,Option H,Rationale A,Rationale B,Rationale C,Rationale D,Rationale E,Rationale F,Rationale G,Rationale H,G,This is a more complex question`;
    
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
    
    // Verify createItem was called with correct data
    await waitFor(() => {
      expect(createItem).toHaveBeenCalledWith(expect.objectContaining({
        QuestionId: 123,
        CreatedDate: '2023-01-01',
        Question: 'Test question with 8 options',
        Type: 'MCQ',
        Status: 'Active',
        responseA: 'Option A',
        responseB: 'Option B',
        responseC: 'Option C',
        responseD: 'Option D',
        responseE: 'Option E',
        responseF: 'Option F',
        responseG: 'Option G',
        responseH: 'Option H',
        rationaleA: 'Rationale A',
        rationaleB: 'Rationale B',
        rationaleC: 'Rationale C',
        rationaleD: 'Rationale D',
        rationaleE: 'Rationale E',
        rationaleF: 'Rationale F',
        rationaleG: 'Rationale G',
        rationaleH: 'Rationale H',
        Key: 'G',
        Rationale: 'This is a more complex question'
      }));
    });
    
    // Verify success message and callback
    await waitFor(() => {
      expect(screen.getByText(/Successfully uploaded 1 item/i)).toBeInTheDocument();
      expect(mockOnUploadComplete).toHaveBeenCalled();
    });
  });

  it('displays detailed error message for header mismatch', async () => {
    render(
      <BulkUpload
        visible={true}
        onDismiss={mockOnDismiss}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    // Create a test CSV file with incorrect headers
    const csvContent = `Id,Created,Question,Type,Status,A,B,C,D,ExplanationA,ExplanationB,ExplanationC,ExplanationD,CorrectAnswer
123,2023-01-01,Test question,MCQ,Active,Option A,Option B,Option C,Option D,Rationale A,Rationale B,Rationale C,Rationale D,A`;
    
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
    
    // Verify error message shows header mismatch details
    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Missing required headers');
      expect(alert).toHaveTextContent('Actual Headers');
      expect(alert).toHaveTextContent('Expected Headers');
      // Check that it lists the problematic headers
      expect(alert).toHaveTextContent('QuestionId');
      expect(alert).toHaveTextContent('CreatedDate');
      expect(alert).toHaveTextContent('responseA');
    });
  });

  it('handles CSV upload without rationale fields', async () => {
    render(
      <BulkUpload
        visible={true}
        onDismiss={mockOnDismiss}
        onUploadComplete={mockOnUploadComplete}
      />
    );

    // Create a test CSV file with only required fields
    const csvContent = `QuestionId,CreatedDate,Question,Type,Status,responseA,responseB,responseC,responseD,Key
123,2023-01-01,Test question without rationales,MCQ,Active,Option A,Option B,Option C,Option D,A`;
    
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
    
    // Verify createItem was called with correct data and empty strings for rationales
    await waitFor(() => {
      expect(createItem).toHaveBeenCalledWith(expect.objectContaining({
        QuestionId: 123,
        CreatedDate: '2023-01-01',
        Question: 'Test question without rationales',
        Type: 'MCQ',
        Status: 'Active',
        responseA: 'Option A',
        responseB: 'Option B',
        responseC: 'Option C',
        responseD: 'Option D',
        rationaleA: '',
        rationaleB: '',
        rationaleC: '',
        rationaleD: '',
        Key: 'A'
      }));
    });
    
    // Verify success message and callback
    await waitFor(() => {
      expect(screen.getByText(/Successfully uploaded 1 item/i)).toBeInTheDocument();
      expect(mockOnUploadComplete).toHaveBeenCalled();
    });
  });
}); 