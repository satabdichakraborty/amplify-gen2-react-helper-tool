// Mock declarations first
const mockNavigate = vi.hoisted(() => vi.fn());
const mockParams = vi.hoisted(() => ({ id: undefined as string | undefined }));
const mockClient = vi.hoisted(() => ({
  models: {
    Item: {
      create: vi.fn(),
      update: vi.fn(),
      get: vi.fn(),
      list: vi.fn(),
    }
  }
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
  useParams: () => mockParams,
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('../../main', () => ({
  client: mockClient
}));

// Then imports
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import CreateEditItem from '../CreateEditItem';

describe('CreateEditItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams.id = undefined;
  });

  test('successfully creates a new item', async () => {
    const user = userEvent.setup();
    render(<CreateEditItem />);

    // Fill out the form
    const stemInput = screen.getByLabelText('Stem');
    await user.type(stemInput, 'test stem');

    // Fill out responses
    const responseContainers = screen.getAllByRole('heading', { level: 2 }).map(heading => heading.closest('div[class*="awsui_container"]'));
    
    for (let i = 0; i < 4; i++) {
      const container = responseContainers[i];
      if (!container) continue;

      const textInput = screen.getAllByLabelText('Text')[i];
      const rationaleInput = screen.getAllByLabelText('Rationale')[i];

      await user.type(textInput, `response ${i}`);
      await user.type(rationaleInput, `rationale ${i}`);
    }

    // Select correct response
    const toggles = screen.getAllByLabelText('Correct');
    await user.click(toggles[0]);

    // Submit form
    await user.click(screen.getByRole('button', { name: 'Create item' }));

    // Verify API call
    await waitFor(() => {
      expect(mockClient.models.Item.create).toHaveBeenCalledWith(expect.objectContaining({
        QuestionId: expect.any(String),
        CreatedDate: expect.any(String),
        stem: 'test stem',
        responseA: 'response 0',
        rationaleA: 'rationale 0',
        responseB: 'response 1',
        rationaleB: 'rationale 1',
        responseC: 'response 2',
        rationaleC: 'rationale 2',
        responseD: 'response 3',
        rationaleD: 'rationale 3',
        correctResponse: '0',
        responsesJson: ''
      }));
    }, { timeout: 10000 });

    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/');
  }, 15000);

  test('handles API errors gracefully', async () => {
    const user = userEvent.setup();
    mockClient.models.Item.create.mockRejectedValueOnce(new Error('API Error'));

    render(<CreateEditItem />);

    // Fill out form minimally
    await user.type(screen.getByLabelText('Stem'), 'test stem');
    for (let i = 0; i < 4; i++) {
      await user.type(screen.getAllByLabelText('Text')[i], `response ${i}`);
      await user.type(screen.getAllByLabelText('Rationale')[i], `rationale ${i}`);
    }

    // Submit form
    await user.click(screen.getByRole('button', { name: 'Create item' }));

    // Verify error message
    await waitFor(() => {
      const errorHeader = screen.getByText('Error');
      const errorMessage = screen.getByText('Failed to save item. Please try again.');
      expect(errorHeader).toBeInTheDocument();
      expect(errorMessage).toBeInTheDocument();
    }, { timeout: 10000 });
  }, 15000);

  test('loads and updates existing item', async () => {
    const user = userEvent.setup();
    mockParams.id = 'existing-id';

    const existingItem = {
      QuestionId: 'existing-id',
      CreatedDate: '2024-01-01T00:00:00Z',
      stem: 'existing stem',
      responseA: 'existing response A',
      rationaleA: 'existing rationale A',
      responseB: 'existing response B',
      rationaleB: 'existing rationale B',
      responseC: 'existing response C',
      rationaleC: 'existing rationale C',
      responseD: 'existing response D',
      rationaleD: 'existing rationale D',
      correctResponse: '1',
      responsesJson: ''
    };

    mockClient.models.Item.list.mockResolvedValueOnce({
      data: [existingItem]
    });

    mockClient.models.Item.get.mockResolvedValueOnce({
      data: existingItem
    });

    render(<CreateEditItem />);

    // Verify form is populated
    await waitFor(() => {
      expect(screen.getByLabelText('Question ID')).toHaveValue('existing-id');
      expect(screen.getByLabelText('Stem')).toHaveValue('existing stem');
      
      const textInputs = screen.getAllByLabelText('Text');
      expect(textInputs[0]).toHaveValue('existing response A');
      expect(textInputs[1]).toHaveValue('existing response B');
      expect(textInputs[2]).toHaveValue('existing response C');
      expect(textInputs[3]).toHaveValue('existing response D');

      const rationaleInputs = screen.getAllByLabelText('Rationale');
      expect(rationaleInputs[0]).toHaveValue('existing rationale A');
      expect(rationaleInputs[1]).toHaveValue('existing rationale B');
      expect(rationaleInputs[2]).toHaveValue('existing rationale C');
      expect(rationaleInputs[3]).toHaveValue('existing rationale D');

      // Verify correct response is selected
      const toggles = screen.getAllByLabelText('Correct');
      expect(toggles[1].closest('[class*="awsui_toggle-control"]')).toHaveClass('awsui_toggle-control-checked_4yi2u_nvz0x_213');
    }, { timeout: 10000 });

    // Update a field and change correct answer
    const stemInput = screen.getByLabelText('Stem');
    await user.clear(stemInput);
    await user.type(stemInput, 'updated stem');

    // Change correct answer from B to C
    const toggles = screen.getAllByLabelText('Correct');
    await user.click(toggles[2]);

    // Submit form
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    // Verify API call
    await waitFor(() => {
      expect(mockClient.models.Item.update).toHaveBeenCalledWith(expect.objectContaining({
        ...existingItem,
        stem: 'updated stem',
        correctResponse: '2',
        CreatedDate: '2024-01-01T00:00:00Z'
      }));
    }, { timeout: 10000 });

    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/');
  }, 15000);
}); 