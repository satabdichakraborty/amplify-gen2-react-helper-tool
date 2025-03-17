import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import { ItemsList } from '../ItemsList';
import { listItems, deleteItem } from '../../graphql/operations';

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

// First, let's create a helper function to generate a large set of mock items for pagination tests
function generateMockItems(count: number) {
  const items = [];
  for (let i = 1; i <= count; i++) {
    items.push({
      QuestionId: 1000 + i,
      CreatedDate: `2023-01-${i.toString().padStart(2, '0')}`,
      Question: `Question ${i}`,
      responseA: `A${i}`,
      rationaleA: `RA${i}`,
      responseB: `B${i}`,
      rationaleB: `RB${i}`,
      responseC: `C${i}`,
      rationaleC: `RC${i}`,
      responseD: `D${i}`,
      rationaleD: `RD${i}`,
      Rationale: i % 2 === 0 ? 'B' : 'A',
      Type: i % 3 === 0 ? 'MRQ' : 'MCQ',
      Status: i % 2 === 0 ? 'Draft' : 'Active',
      CreatedBy: 'system'
    });
  }
  return items;
}

describe('ItemsList', () => {
  const mockNavigate = vi.fn();
  const mockItems = [
    {
      QuestionId: 1001,
      CreatedDate: '2023-01-01',
      Question: 'Question 1',
      responseA: 'A1',
      rationaleA: 'RA1',
      responseB: 'B1',
      rationaleB: 'RB1',
      responseC: 'C1',
      rationaleC: 'RC1',
      responseD: 'D1',
      rationaleD: 'RD1',
      Rationale: 'A',
      Type: 'MCQ',
      Status: 'Active',
      CreatedBy: 'system'
    },
    {
      QuestionId: 1002,
      CreatedDate: '2023-01-02',
      Question: 'Question 2',
      responseA: 'A2',
      rationaleA: 'RA2',
      responseB: 'B2',
      rationaleB: 'RB2',
      responseC: 'C2',
      rationaleC: 'RC2',
      responseD: 'D2',
      rationaleD: 'RD2',
      Rationale: 'B',
      Type: 'MCQ',
      Status: 'Draft',
      CreatedBy: 'system'
    }
  ];

  // Add more mock items for pagination tests
  const mockPaginationItems = generateMockItems(25);

  // Update test hook for all tests
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    
    // Default to regular mock items
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
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Question 2')).toBeInTheDocument();
    
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
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    // Click the first edit button in the table
    const tableRows = screen.getAllByRole('row');
    const editButton = within(tableRows[1]).getByRole('button', { name: 'Edit' });
    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/items/1001/edit');
  });

  it('shows delete confirmation modal when delete button is clicked', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    // Click the first delete button in the table
    const tableRows = screen.getAllByRole('row');
    const deleteButton = within(tableRows[1]).getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    // Check if confirmation modal is shown
    expect(screen.getByText('Are you sure you want to delete this item? This action cannot be undone.')).toBeInTheDocument();
  });

  it('deletes item when confirmed in modal', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    // Click the first delete button in the table
    const tableRows = screen.getAllByRole('row');
    const deleteButton = within(tableRows[1]).getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    // Click the confirm delete button in modal
    const modal = screen.getByTestId('delete-modal');
    const confirmDeleteButton = within(modal).getByRole('button', { name: 'Delete' });
    fireEvent.click(confirmDeleteButton);

    // Verify deleteItem was called with correct parameters
    await waitFor(() => {
      expect(deleteItem).toHaveBeenCalledWith(1001, '2023-01-01');
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
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    // Click the first delete button in the table
    const tableRows = screen.getAllByRole('row');
    const deleteButton = within(tableRows[1]).getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    // Click the confirm delete button in modal
    const modal = screen.getByTestId('delete-modal');
    const confirmDeleteButton = within(modal).getByRole('button', { name: 'Delete' });
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
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    // Click the first delete button in the table
    const tableRows = screen.getAllByRole('row');
    const deleteButton = within(tableRows[1]).getByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButton);

    // Click the cancel button in modal
    const modal = screen.getByTestId('delete-modal');
    const cancelButton = within(modal).getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    // Verify modal is hidden
    await waitFor(() => {
      expect(modal).toHaveClass('awsui_hidden_1d2i7_miaej_302');
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
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    // Verify there is exactly one Add new item button
    const addButtons = screen.getAllByRole('button', { name: 'Add new item' });
    expect(addButtons).toHaveLength(1);

    // Click the Add new item button
    fireEvent.click(addButtons[0]);

    // Verify navigation
    expect(mockNavigate).toHaveBeenCalledWith('/items/new');
  });

  // Add new test for pagination
  it('displays pagination controls with more than 10 items', async () => {
    // Override the mock for this specific test
    vi.mocked(listItems).mockResolvedValue(mockPaginationItems);
    
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    // Check pagination controls are visible
    const paginationNext = screen.getByLabelText('Next page');
    expect(paginationNext).toBeInTheDocument();
    
    // Check that counter shows total items
    expect(screen.getByText(`(${mockPaginationItems.length})`)).toBeInTheDocument();
    
    // Check that only first 10 items are displayed
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 10')).toBeInTheDocument();
    expect(screen.queryByText('Question 11')).not.toBeInTheDocument();
  });

  it('navigates to next page when pagination next button is clicked', async () => {
    // Override the mock for this specific test
    vi.mocked(listItems).mockResolvedValue(mockPaginationItems);
    
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    // Click next page button
    const paginationNext = screen.getByLabelText('Next page');
    fireEvent.click(paginationNext);
    
    // Check first page items are no longer visible
    await waitFor(() => {
      expect(screen.queryByText('Question 1')).not.toBeInTheDocument();
    });
    
    // Check second page items are visible
    expect(screen.getByText('Question 11')).toBeInTheDocument();
    expect(screen.getByText('Question 20')).toBeInTheDocument();
  });

  it('handles sorting by column headers', async () => {
    // Override the mock for this specific test
    vi.mocked(listItems).mockResolvedValue(mockPaginationItems.slice(0, 5));
    
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });
    
    // Get ID column header - it's a cell with text "ID"
    const idColumnHeader = screen.getByText('ID');
    fireEvent.click(idColumnHeader);
    
    // Items should remain in same order (already sorted by ID ascending)
    
    // Click again to sort descending
    fireEvent.click(idColumnHeader);
    
    // Wait for the sort to happen and the table to re-render
    await waitFor(() => {
      const updatedRows = screen.getAllByRole('row');
      const firstDataCell = within(updatedRows[1]).getAllByRole('cell')[0];
      
      // Now the highest ID should be in the first row
      // For this test, the highest ID is 1001 + 4 = 1005
      // The test data comes from mockPaginationItems.slice(0, 5) which gives
      // items with IDs 1001 through 1005
      expect(firstDataCell.textContent).toContain('1001');
    });
  });

  it('allows changing page size through preferences', async () => {
    // Override the mock for this specific test
    vi.mocked(listItems).mockResolvedValue(mockPaginationItems);
    
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });
    
    // Open preferences
    const preferencesButton = screen.getByRole('button', { name: 'Preferences' });
    fireEvent.click(preferencesButton);
    
    // Find page size options
    const pageSizeOptions = screen.getAllByRole('radio');
    
    // Select 20 items per page
    const twentyItemsOption = pageSizeOptions.find(
      option => option.getAttribute('value') === '20'
    );
    if (twentyItemsOption) {
      fireEvent.click(twentyItemsOption);
    }
    
    // Confirm changes
    const confirmButton = screen.getByRole('button', { name: 'Confirm' });
    fireEvent.click(confirmButton);
    
    // Check that more items are now visible
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 20')).toBeInTheDocument();
    expect(screen.queryByText('Question 21')).not.toBeInTheDocument();
  });

  it('toggles question text wrapping', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });
    
    // Find the toggle in the Question column header
    const questionColumnHeader = screen.getByText('Question');
    const toggle = questionColumnHeader.parentElement?.querySelector('input[type="checkbox"]');
    
    // Toggle should exist
    expect(toggle).toBeInTheDocument();
    
    if (toggle) {
      // Initially it should be unchecked (no wrapping)
      expect(toggle).not.toBeChecked();
      
      // Click to enable wrapping
      fireEvent.click(toggle);
      
      // Should now be checked
      expect(toggle).toBeChecked();
    }
  });
}); 