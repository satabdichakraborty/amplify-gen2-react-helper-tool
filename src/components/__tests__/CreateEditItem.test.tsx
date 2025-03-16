import { describe, expect, test, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CreateEditItem from '../CreateEditItem';
import { MemoryRouter } from 'react-router-dom';

// Mock declarations first
const mockNavigate = vi.hoisted(() => vi.fn());
const mockParams = vi.hoisted(() => ({ id: '123' as string | undefined }));
const mockClient = vi.hoisted(() => ({
  models: {
    Item: {
      create: vi.fn().mockResolvedValue({ success: true }),
      update: vi.fn().mockResolvedValue({ success: true }),
      get: vi.fn(),
      list: vi.fn(),
    }
  }
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

vi.mock('../../main', () => ({
  client: mockClient
}));

describe('CreateEditItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParams.id = '123';
  });

  const getFormField = (label: string) => {
    return screen.getByLabelText(label);
  };

  const getToggle = (index: number) => {
    const toggles = screen.getAllByLabelText('Is Correct Answer');
    return toggles[index];
  };

  test('successfully creates a new item', async () => {
    const user = userEvent.setup();
    mockParams.id = undefined;

    render(
      <MemoryRouter>
        <CreateEditItem />
      </MemoryRouter>
    );

    // Fill out the form
    const stemInput = getFormField('Stem');
    await user.type(stemInput, 'test stem');

    const responseInputs = screen.getAllByLabelText('Text');
    await user.type(responseInputs[0], 'response A');
    await user.type(responseInputs[1], 'response B');
    await user.type(responseInputs[2], 'response C');
    await user.type(responseInputs[3], 'response D');

    const rationaleInputs = screen.getAllByLabelText('Rationale');
    await user.type(rationaleInputs[0], 'rationale A');
    await user.type(rationaleInputs[1], 'rationale B');
    await user.type(rationaleInputs[2], 'rationale C');
    await user.type(rationaleInputs[3], 'rationale D');

    // Set correct answer
    const toggle = getToggle(1);
    await user.click(toggle);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create item/i });
    await user.click(submitButton);

    // Wait for loading state to complete
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /loading/i })).not.toBeInTheDocument();
    });

    // Verify API call
    await waitFor(() => {
      expect(mockClient.models.Item.create).toHaveBeenCalledWith(
        expect.objectContaining({
          Question: 'test stem',
          responseA: 'response A',
          responseB: 'response B',
          responseC: 'response C',
          responseD: 'response D',
          rationaleA: 'rationale A',
          rationaleB: 'rationale B',
          rationaleC: 'rationale C',
          rationaleD: 'rationale D',
          Key: 'B'
        })
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('handles API errors', async () => {
    mockClient.models.Item.create.mockRejectedValueOnce(new Error('API Error'));
    mockParams.id = undefined;
    
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CreateEditItem />
      </MemoryRouter>
    );
    
    // Fill out required fields
    const stemInput = getFormField('Stem');
    await user.type(stemInput, 'test stem');

    const responseInputs = screen.getAllByLabelText('Text');
    await user.type(responseInputs[0], 'response A');
    await user.type(responseInputs[1], 'response B');
    await user.type(responseInputs[2], 'response C');
    await user.type(responseInputs[3], 'response D');

    // Set correct answer
    const toggle = getToggle(0);
    await user.click(toggle);

    // Submit form
    const submitButton = screen.getByRole('button', { name: /create item/i });
    await user.click(submitButton);

    // Wait for error alert to appear
    await waitFor(() => {
      const alert = screen.getByTestId('error-alert');
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent('Failed to save item. Please try again.');
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test('loads and updates existing item', async () => {
    const user = userEvent.setup();
    mockParams.id = '123';

    // Mock existing item data
    const mockItem = {
      QuestionId: '123',
      CreatedDate: '2024-01-01',
      Question: 'existing stem',
      responseA: 'existing A',
      responseB: 'existing B',
      responseC: 'existing C',
      responseD: 'existing D',
      rationaleA: 'rationale A',
      rationaleB: 'rationale B',
      rationaleC: 'rationale C',
      rationaleD: 'rationale D',
      Key: 'B',
      Rationale: 'general rationale'
    };

    mockClient.models.Item.list.mockResolvedValue({
      data: [{ QuestionId: '123', CreatedDate: '2024-01-01' }]
    });
    mockClient.models.Item.get.mockResolvedValue({ data: mockItem });

    render(
      <MemoryRouter>
        <CreateEditItem />
      </MemoryRouter>
    );

    // Wait for form to be populated
    await waitFor(() => {
      const stemInput = getFormField('Stem');
      expect(stemInput).toHaveValue('existing stem');

      const responseInputs = screen.getAllByLabelText('Text');
      expect(responseInputs[0]).toHaveValue('existing A');
      expect(responseInputs[1]).toHaveValue('existing B');
      expect(responseInputs[2]).toHaveValue('existing C');
      expect(responseInputs[3]).toHaveValue('existing D');

      const toggles = screen.getAllByLabelText('Is Correct Answer');
      expect(toggles[1]).toBeChecked();
    });

    // Make changes
    const responseInputs = screen.getAllByLabelText('Text');
    await user.clear(responseInputs[0]);
    await user.type(responseInputs[0], 'updated A');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /save changes/i });
    await user.click(submitButton);

    // Verify update API call
    await waitFor(() => {
      expect(mockClient.models.Item.update).toHaveBeenCalledWith(
        expect.objectContaining({
          QuestionId: '123',
          Question: 'existing stem',
          responseA: 'updated A',
          Key: 'B'
        })
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
}); 