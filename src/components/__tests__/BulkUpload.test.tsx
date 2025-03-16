import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BulkUpload } from '../BulkUpload';

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
  const mockFile = new File(
    [
      'QuestionId,Type,Status,Question,Key,Notes,Rationale,CreatedDate,CreatedBy,Response A,Response B,Response C,Response D,Response E,Response F,Rationale A,Rationale B,Rationale C,Rationale D,Rationale E,Rationale F,Topic,Knowledge-Skills,Tags\n' +
      '1,MCQ,Active,Test question?,A,Note 1,Main rationale,2024-03-15T12:00:00.000Z,user1,A1,B1,C1,D1,E1,F1,RA1,RB1,RC1,RD1,RE1,RF1,Math,Algebra,tag1'
    ],
    'test.csv',
    { type: 'text/csv' }
  );

  const mockInvalidFile = new File(
    [
      'QuestionId,Type,Status,Question,Key,Notes,Rationale,CreatedDate,CreatedBy,Response A,Response B,Response C,Response D,Response E,Response F,Rationale A,Rationale B,Rationale C,Rationale D,Rationale E,Rationale F,Topic,Knowledge-Skills,Tags\n' +
      '1,MCQ,Active,Test question?,X,Note 1,Main rationale,invalid-date,user1,A1,B1,C1,D1,E1,F1,RA1,RB1,RC1,RD1,RE1,RF1,Math,Algebra,tag1'
    ],
    'invalid.csv',
    { type: 'text/csv' }
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload button', () => {
    render(<BulkUpload />);
    expect(screen.getByText('Upload CSV File')).toBeInTheDocument();
  });

  it('handles valid CSV file upload', async () => {
    mockCreate.mockResolvedValueOnce({ success: true });
    render(<BulkUpload />);

    const input = screen.getByLabelText('Upload CSV File');
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        QuestionId: '1',
        Type: 'MCQ',
        Status: 'Active',
        Question: 'Test question?',
        Key: 'A',
        Notes: 'Note 1',
        Rationale: 'Main rationale',
        CreatedDate: '2024-03-15T12:00:00.000Z',
        CreatedBy: 'user1',
        responseA: 'A1',
        responseB: 'B1',
        responseC: 'C1',
        responseD: 'D1',
        responseE: 'E1',
        responseF: 'F1',
        rationaleA: 'RA1',
        rationaleB: 'RB1',
        rationaleC: 'RC1',
        rationaleD: 'RD1',
        rationaleE: 'RE1',
        rationaleF: 'RF1',
        Topic: 'Math',
        KnowledgeSkills: 'Algebra',
        Tags: 'tag1',
        responsesJson: JSON.stringify({
          responses: {
            A: 'A1',
            B: 'B1',
            C: 'C1',
            D: 'D1',
            E: 'E1',
            F: 'F1'
          },
          rationales: {
            A: 'RA1',
            B: 'RB1',
            C: 'RC1',
            D: 'RD1',
            E: 'RE1',
            F: 'RF1'
          }
        })
      });
    });

    expect(await screen.findByText('Successfully uploaded 1 items')).toBeInTheDocument();
  });

  it('shows validation errors for invalid CSV', async () => {
    render(<BulkUpload />);

    const input = screen.getByLabelText('Upload CSV File');
    fireEvent.change(input, { target: { files: [mockInvalidFile] } });

    await waitFor(() => {
      expect(screen.getByText(/Invalid date format/)).toBeInTheDocument();
      expect(screen.getByText(/Invalid Key. Must be A, B, C, D, E, or F/)).toBeInTheDocument();
    });
  });

  it('handles upload errors gracefully', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Network error'));
    render(<BulkUpload />);

    const input = screen.getByLabelText('Upload CSV File');
    fireEvent.change(input, { target: { files: [mockFile] } });

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalled();
    });

    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toHaveTextContent('Upload failed: Network error');
  });
}); 