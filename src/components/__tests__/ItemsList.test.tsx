import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import { ItemsList } from '../ItemsList';
import { listItems, deleteItem, type Item } from '../../graphql/operations';

// Mock the router hooks
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn()
  };
});

// Mock the GraphQL operations
vi.mock('../../graphql/operations', () => ({
  listItems: vi.fn(),
  deleteItem: vi.fn()
}));

// Mock BulkUpload component
vi.mock('../BulkUpload', () => ({
  BulkUpload: vi.fn(({ onUploadComplete }) => (
    <div data-testid="bulk-upload-modal">
      <button onClick={onUploadComplete}>Complete Upload</button>
    </div>
  ))
}));

describe('ItemsList', () => {
  const mockNavigate = vi.fn();
  const mockItems: Item[] = [
    {
      QuestionId: '1',
      CreatedDate: '2024-01-01T00:00:00Z',
      stem: 'Test Question 1',
      responseA: 'A1',
      rationaleA: 'RA1',
      responseB: 'B1',
      rationaleB: 'RB1',
      responseC: 'C1',
      rationaleC: 'RC1',
      responseD: 'D1',
      rationaleD: 'RD1',
      correctResponse: '0',
      responsesJson: '',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    } as Item,
    {
      QuestionId: '2',
      CreatedDate: '2024-01-02T00:00:00Z',
      stem: 'Test Question 2',
      responseA: 'A2',
      rationaleA: 'RA2',
      responseB: 'B2',
      rationaleB: 'RB2',
      responseC: 'C2',
      rationaleC: 'RC2',
      responseD: 'D2',
      rationaleD: 'RD2',
      correctResponse: '1',
      responsesJson: '',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z'
    } as Item
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(listItems).mockResolvedValue(mockItems);
  });

  it('renders the list of items', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Question 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Question 2')).toBeInTheDocument();
    
    // Get all buttons in the table rows
    const tableRows = screen.getAllByRole('row');
    const editButtons = tableRows.slice(1).map(row => within(row).getByRole('button', { name: 'Edit' }));
    const deleteButtons = tableRows.slice(1).map(row => within(row).getByRole('button', { name: 'Delete' }));
    
    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('navigates to edit page when edit button is clicked', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Question 1')).toBeInTheDocument();
    });

    // Click the first edit button in the table
    const tableRows = screen.getAllByRole('row');
    const editButton = within(tableRows[1]).getByRole('button', { name: 'Edit' });
    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/items/1/edit');
  });

  it('shows delete confirmation modal when delete button is clicked', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Question 1')).toBeInTheDocument();
    });

    // Click the first delete button in the table
    const tableRows = screen.getAllByRole('row');
    const deleteButton = within(tableRows[1]).getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    // Check if confirmation modal is shown
    const deleteModal = screen.getByRole('dialog', { name: 'Delete Item' });
    expect(deleteModal).toBeInTheDocument();
    expect(within(deleteModal).getByText('Are you sure you want to delete this item? This action cannot be undone.')).toBeInTheDocument();
  });

  it('deletes item when confirmed in modal', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Question 1')).toBeInTheDocument();
    });

    // Click the first delete button in the table
    const tableRows = screen.getAllByRole('row');
    const deleteButton = within(tableRows[1]).getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    // Click the confirm delete button in modal
    const deleteModal = screen.getByRole('dialog', { name: 'Delete Item' });
    const confirmDeleteButton = within(deleteModal).getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmDeleteButton);

    // Verify deleteItem was called with correct parameters
    await waitFor(() => {
      expect(deleteItem).toHaveBeenCalledWith('1', '2024-01-01T00:00:00Z');
    });

    // Verify listItems was called again to refresh the list
    expect(listItems).toHaveBeenCalledTimes(2);
  });

  it('shows error alert when delete fails', async () => {
    vi.mocked(deleteItem).mockRejectedValueOnce(new Error('Delete failed'));

    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Question 1')).toBeInTheDocument();
    });

    // Click the first delete button in the table
    const tableRows = screen.getAllByRole('row');
    const deleteButton = within(tableRows[1]).getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    // Click the confirm delete button in modal
    const deleteModal = screen.getByRole('dialog', { name: 'Delete Item' });
    const confirmDeleteButton = within(deleteModal).getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmDeleteButton);

    // Verify error alert is shown
    await waitFor(() => {
      expect(screen.getByText('Error deleting item')).toBeInTheDocument();
    });
  });

  it('closes delete modal when cancel is clicked', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Question 1')).toBeInTheDocument();
    });

    // Click the first delete button in the table
    const tableRows = screen.getAllByRole('row');
    const deleteButton = within(tableRows[1]).getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    // Click the cancel button in modal
    const deleteModal = screen.getByRole('dialog', { name: 'Delete Item' });
    const cancelButton = within(deleteModal).getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    // Verify modal is hidden
    await waitFor(() => {
      expect(deleteModal).toHaveClass('awsui_hidden_1d2i7_miaej_302');
    });
  });

  it('has exactly one Add new item button that navigates correctly', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Question 1')).toBeInTheDocument();
    });

    // Verify there is exactly one Add new item button
    const addButtons = screen.getAllByRole('button', { name: 'Add new item' });
    expect(addButtons).toHaveLength(1);

    // Click the Add new item button
    fireEvent.click(addButtons[0]);

    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/items/new');
  });

  it('shows upload modal when Upload Items button is clicked', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Question 1')).toBeInTheDocument();
    });

    // Click the Upload Items button
    const uploadButton = screen.getByRole('button', { name: 'Upload Items' });
    fireEvent.click(uploadButton);

    // Verify upload modal is shown
    const uploadModal = screen.getByRole('dialog', { name: 'Upload Items' });
    expect(uploadModal).toBeInTheDocument();
    expect(screen.getByTestId('bulk-upload-modal')).toBeInTheDocument();
  });

  it('closes upload modal and refreshes list when upload completes', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Test Question 1')).toBeInTheDocument();
    });

    // Click the Upload Items button
    const uploadButton = screen.getByRole('button', { name: 'Upload Items' });
    fireEvent.click(uploadButton);

    // Get the upload modal
    const uploadModal = screen.getByRole('dialog', { name: 'Upload Items' });
    expect(uploadModal).toBeInTheDocument();

    // Click the Complete Upload button
    const completeButton = within(uploadModal).getByRole('button', { name: 'Complete Upload' });
    fireEvent.click(completeButton);

    // Verify modal is closed and list is refreshed
    await waitFor(() => {
      expect(uploadModal).toHaveClass('awsui_hidden_1d2i7_miaej_302');
    });
    expect(listItems).toHaveBeenCalledTimes(2);
  });
}); 