import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BulkUpload } from '../BulkUpload';

// Mock the generateClient function
const mockCreate = vi.hoisted(() => vi.fn());
vi.mock('aws-amplify/data', () => ({
  generateClient: () => ({
    models: {
      Item: {
        create: mockCreate
      }
    }
  })
}));

describe('BulkUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles valid CSV upload', async () => {
    const onUploadComplete = vi.fn();
    render(<BulkUpload onUploadComplete={onUploadComplete} />);

    // Create a valid CSV file
    const validCSV = new File([
      'QuestionId,Type,Status,Question,Key,Notes,Rationale,CreatedDate,CreatedBy,Response A,Response B,Response C,Response D,Response E,Response F,Rationale A,Rationale B,Rationale C,Rationale D,Rationale E,Rationale F,Topic,Knowledge-Skills,Tags\n' +
      'Q1,MCQ,Active,Test question?,A,,Test rationale,2024-03-20T12:00:00.000Z,test@example.com,A1,B1,C1,D1,,,RA1,RB1,RC1,RD1,,,Topic 1,Knowledge 1,'
    ], 'test.csv', { type: 'text/csv' });

    // Get the file input and simulate file selection
    const fileInput = screen.getByTestId('csv-file-input');
    await userEvent.upload(fileInput, validCSV);

    // Now that a file is selected, the upload button should appear
    const uploadButton = await screen.findByRole('button', { name: /upload/i });
    await userEvent.click(uploadButton);

    // Verify that the API was called with the correct parameters
    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        QuestionId: 'Q1',
        Type: 'MCQ',
        Status: 'Active',
        Question: 'Test question?',
        Key: 'A',
        Notes: '',
        Rationale: 'Test rationale',
        CreatedDate: '2024-03-20T12:00:00.000Z',
        CreatedBy: 'test@example.com',
        responseA: 'A1',
        responseB: 'B1',
        responseC: 'C1',
        responseD: 'D1',
        responseE: '',
        responseF: '',
        rationaleA: 'RA1',
        rationaleB: 'RB1',
        rationaleC: 'RC1',
        rationaleD: 'RD1',
        rationaleE: '',
        rationaleF: '',
        Topic: 'Topic 1',
        KnowledgeSkills: 'Knowledge 1',
        Tags: '',
        responsesJson: JSON.stringify({
          responses: {
            A: 'A1',
            B: 'B1',
            C: 'C1',
            D: 'D1'
          },
          rationales: {
            A: 'RA1',
            B: 'RB1',
            C: 'RC1',
            D: 'RD1'
          }
        })
      });
    });

    // Verify success message and callback
    await screen.findByText('Successfully uploaded 1 items');
    await waitFor(() => {
      expect(onUploadComplete).toHaveBeenCalled();
    }, { timeout: 3000 }); // Account for the 2 second delay
  });

  it('handles invalid CSV format', async () => {
    render(<BulkUpload />);

    // Create an invalid CSV file (missing required fields)
    const invalidCSV = new File([
      'QuestionId,Type\n' +
      'Q1,MCQ'
    ], 'invalid.csv', { type: 'text/csv' });

    // Get the file input and simulate file selection
    const fileInput = screen.getByTestId('csv-file-input');
    await userEvent.upload(fileInput, invalidCSV);

    // Now that a file is selected, the upload button should appear
    const uploadButton = await screen.findByRole('button', { name: /upload/i });
    await userEvent.click(uploadButton);

    // Verify error message
    await screen.findByText(/Missing required field/);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('handles API errors', async () => {
    mockCreate.mockRejectedValueOnce(new Error('API Error'));
    render(<BulkUpload />);

    // Create a valid CSV file
    const validCSV = new File([
      'QuestionId,Type,Status,Question,Key,Notes,Rationale,CreatedDate,CreatedBy,Response A,Response B,Response C,Response D,Response E,Response F,Rationale A,Rationale B,Rationale C,Rationale D,Rationale E,Rationale F,Topic,Knowledge-Skills,Tags\n' +
      'Q1,MCQ,Active,Test question?,A,,Test rationale,2024-03-20T12:00:00.000Z,test@example.com,A1,B1,C1,D1,,,RA1,RB1,RC1,RD1,,,Topic 1,Knowledge 1,'
    ], 'test.csv', { type: 'text/csv' });

    // Get the file input and simulate file selection
    const fileInput = screen.getByTestId('csv-file-input');
    await userEvent.upload(fileInput, validCSV);

    // Now that a file is selected, the upload button should appear
    const uploadButton = await screen.findByRole('button', { name: /upload/i });
    await userEvent.click(uploadButton);

    // Verify error message
    await screen.findByText(/Upload failed: API Error/);
  });
}); 