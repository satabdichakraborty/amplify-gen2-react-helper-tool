import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useParams } from 'react-router-dom';
import { vi } from 'vitest';
import CreateEditItem from '../CreateEditItem';
import { client } from '../../main';

// Define the Item type based on the schema
interface Item {
  readonly QuestionId: string;
  readonly CreatedDate: string;
  readonly stem: string;
  readonly responseA: string;
  readonly rationaleA: string;
  readonly responseB: string;
  readonly rationaleB: string;
  readonly responseC: string;
  readonly rationaleC: string;
  readonly responseD: string;
  readonly rationaleD: string;
  readonly correctResponse: string;
  readonly responsesJson: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: vi.fn(),
    useNavigate: () => vi.fn()
  };
});

vi.mock('../../main', () => ({
  client: {
    models: {
      Item: {
        create: vi.fn(),
        update: vi.fn(),
        get: vi.fn()
      }
    }
  }
}));

describe('CreateEditItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <CreateEditItem />
      </MemoryRouter>
    );
  };

  it('renders the form with all required fields', async () => {
    vi.mocked(useParams).mockReturnValue({});
    
    renderComponent();
    
    // Check for main form elements
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Create New Item' })).toBeInTheDocument();
    });
    expect(screen.getByLabelText('Stem')).toBeInTheDocument();
    expect(screen.getByLabelText('Question ID')).toBeInTheDocument();
    
    // Check for response fields
    const textInputs = screen.getAllByLabelText('Text');
    const rationaleInputs = screen.getAllByLabelText('Rationale');
    
    expect(textInputs).toHaveLength(4);
    expect(rationaleInputs).toHaveLength(4);
    
    for (let i = 1; i <= 4; i++) {
      expect(screen.getByRole('heading', { name: `Response ${i}` })).toBeInTheDocument();
    }
  });

  it('shows validation errors when submitting empty form', async () => {
    vi.mocked(useParams).mockReturnValue({});
    
    renderComponent();
    
    // Try to submit empty form
    const submitButton = await waitFor(() => screen.getByRole('button', { name: /create item/i }));
    fireEvent.click(submitButton);
    
    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('Stem is required')).toBeInTheDocument();
    });
  });

  it('successfully creates a new item', async () => {
    vi.mocked(useParams).mockReturnValue({});
    const mockItem: Item = {
      QuestionId: '123',
      CreatedDate: new Date().toISOString(),
      stem: 'Test question?',
      responseA: 'Response 1',
      rationaleA: 'Rationale 1',
      responseB: 'Response 2',
      rationaleB: 'Rationale 2',
      responseC: 'Response 3',
      rationaleC: 'Rationale 3',
      responseD: 'Response 4',
      rationaleD: 'Rationale 4',
      correctResponse: '0',
      responsesJson: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    vi.mocked(client.models.Item.create).mockResolvedValueOnce({ data: mockItem });
    
    renderComponent();
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('Stem'), { target: { value: 'Test question?' } });
    
    // Fill out responses
    const responseText = screen.getAllByLabelText('Text');
    const responseRationale = screen.getAllByLabelText('Rationale');
    
    // Fill out all responses to pass validation
    for (let i = 0; i < 4; i++) {
      fireEvent.change(responseText[i], { target: { value: `Response ${i + 1}` } });
      fireEvent.change(responseRationale[i], { target: { value: `Rationale ${i + 1}` } });
    }
    
    // Mark first response as correct
    const correctToggle = screen.getAllByLabelText('Correct')[0];
    fireEvent.click(correctToggle);
    
    // Submit the form
    const submitButton = await waitFor(() => screen.getByRole('button', { name: /create item/i }));
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
    fireEvent.click(submitButton);
    
    // Verify API call
    await waitFor(() => {
      expect(client.models.Item.create).toHaveBeenCalledWith(expect.objectContaining({
        QuestionId: expect.any(String),
        stem: 'Test question?',
        responseA: 'Response 1',
        rationaleA: 'Rationale 1',
        responseB: 'Response 2',
        rationaleB: 'Rationale 2',
        responseC: 'Response 3',
        rationaleC: 'Rationale 3',
        responseD: 'Response 4',
        rationaleD: 'Rationale 4',
        correctResponse: '0'
      }));
    });
  });

  it('handles API errors gracefully', async () => {
    vi.mocked(useParams).mockReturnValue({});
    
    // Mock create to throw an error
    vi.mocked(client.models.Item.create).mockRejectedValueOnce(new Error('API Error'));
    
    renderComponent();
    
    // Fill out the form
    fireEvent.change(screen.getByLabelText('Stem'), { target: { value: 'Test question?' } });
    
    // Fill out responses
    const responseText = screen.getAllByLabelText('Text');
    const responseRationale = screen.getAllByLabelText('Rationale');
    
    // Fill out all responses to pass validation
    for (let i = 0; i < 4; i++) {
      fireEvent.change(responseText[i], { target: { value: `Response ${i + 1}` } });
      fireEvent.change(responseRationale[i], { target: { value: `Rationale ${i + 1}` } });
    }
    
    // Mark first response as correct
    const correctToggle = screen.getAllByLabelText('Correct')[0];
    fireEvent.click(correctToggle);
    
    // Submit the form
    const submitButton = await waitFor(() => screen.getByRole('button', { name: /create item/i }));
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
    fireEvent.click(submitButton);
    
    // Check for error message
    await waitFor(() => {
      const alert = screen.getByText('Failed to save item. Please try again.');
      expect(alert).toBeInTheDocument();
    });
  });

  it('loads and updates existing item', async () => {
    vi.mocked(useParams).mockReturnValue({ id: '123' });
    
    const existingItem: Item = {
      QuestionId: '123',
      CreatedDate: '2024-01-01',
      stem: 'Existing question?',
      responseA: 'Response A',
      rationaleA: 'Rationale A',
      responseB: 'Response B',
      rationaleB: 'Rationale B',
      responseC: 'Response C',
      rationaleC: 'Rationale C',
      responseD: 'Response D',
      rationaleD: 'Rationale D',
      correctResponse: '0',
      responsesJson: 'General rationale',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };
    
    vi.mocked(client.models.Item.get).mockResolvedValueOnce({ data: existingItem });
    vi.mocked(client.models.Item.update).mockResolvedValueOnce({ data: existingItem });
    
    renderComponent();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Edit Item' })).toBeInTheDocument();
    });
    
    // Verify form is populated with existing data
    expect(screen.getByLabelText('Stem')).toHaveValue('Existing question?');
    
    // Submit the form
    const submitButton = await waitFor(() => screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
    fireEvent.click(submitButton);
    
    // Verify update API call
    await waitFor(() => {
      expect(client.models.Item.update).toHaveBeenCalledWith(expect.objectContaining({
        QuestionId: '123',
        stem: 'Existing question?'
      }));
    });
  });
}); 