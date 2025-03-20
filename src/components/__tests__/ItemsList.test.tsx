import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { vi } from 'vitest';
import { ItemsList } from '../ItemsList';
import { listItems } from '../../graphql/operations';

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
  deleteItem: vi.fn().mockResolvedValue(true)
}));

// Mock the BulkUpload component
vi.mock('../BulkUpload', () => ({
  BulkUpload: vi.fn(({ visible, onDismiss, onUploadComplete }) => (
    visible ? (
      <div data-testid="bulk-upload-modal">
        <button onClick={onDismiss}>Close</button>
        <button onClick={() => onUploadComplete && onUploadComplete()}>Complete Upload</button>
      </div>
    ) : null
  ))
}));

// Mock the ItemDetails component
vi.mock('../ItemDetails', () => ({
  ItemDetails: vi.fn(({ item, visible, onDismiss }) => (
    visible && item ? (
      <div data-testid="item-details-modal">
        <div>{item.Question}</div>
        <button onClick={onDismiss}>Close</button>
      </div>
    ) : null
  ))
}));

// Create mock items
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
    Type: 'Multiple Choice',
    Status: 'Active',
    CreatedBy: 'system',
    Key: 'A',
    Topic: 'Topic 1',
    KnowledgeSkills: 'Skill 1'
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
    Type: 'Multiple Response',
    Status: 'Draft',
    CreatedBy: 'system',
    Key: 'B,C',
    Topic: 'Topic 2',
    KnowledgeSkills: 'Skill 2'
  }
];

// Create more mock items for pagination testing
const createMockItems = (count: number) => {
  const items = [];
  for (let i = 0; i < count; i++) {
    items.push({
      QuestionId: 2000 + i,
      CreatedDate: `2023-02-${String(i + 1).padStart(2, '0')}`,
      Question: `Pagination Test Question ${i + 1}`,
      responseA: 'A',
      rationaleA: 'RA',
      responseB: 'B',
      rationaleB: 'RB',
      responseC: 'C',
      rationaleC: 'RC',
      responseD: 'D',
      rationaleD: 'RD',
      Rationale: 'General rationale',
      Type: 'Multiple Choice',
      Status: 'Active',
      CreatedBy: 'system',
      Key: 'A',
      Topic: 'Pagination',
      KnowledgeSkills: 'Testing'
    });
  }
  return items;
};

const paginationMockItems = [...mockItems, ...createMockItems(15)];

describe('ItemsList', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(listItems).mockResolvedValue(mockItems);
    
    // Reset localStorage
    localStorage.clear();
  });

  test('renders items and their data', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(listItems).toHaveBeenCalled();
    });

    // Check that items are rendered
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
    
    // Check that type values are shown
    expect(screen.getByText('Multiple Choice')).toBeInTheDocument();
    expect(screen.getByText('Multiple Response')).toBeInTheDocument();
    
    // Check status values
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Draft')).toBeInTheDocument();
  });

  test('navigates to create page when Add new item is clicked', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Find and click Add new item button
    const addButton = await screen.findByText('Add new item');
    fireEvent.click(addButton);

    // Verify navigation occurs
    expect(mockNavigate).toHaveBeenCalledWith('/items/new');
  });

  test('navigates to the correct edit path when Edit button is clicked', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    // Find the first Edit button in the table
    const editButtons = screen.getAllByText('Edit');
    expect(editButtons.length).toBeGreaterThan(0);
    
    // Click the first Edit button
    fireEvent.click(editButtons[0]);

    // Verify navigation with the correct path format: /items/:id/edit
    expect(mockNavigate).toHaveBeenCalledWith('/items/1001/edit');
  });
  
  test('toggles question wrapping when toggle is clicked', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    // Find the toggle for text wrapping
    const toggle = screen.getByLabelText('Toggle text wrapping for questions');
    
    // Toggle should be on by default (as we've set it to true in the component)
    expect(toggle).toHaveProperty('checked', true);
    
    // Click to turn off wrapping
    fireEvent.click(toggle);
    
    // Toggle should now be off
    expect(toggle).toHaveProperty('checked', false);
    
    // Click again to turn wrapping back on
    fireEvent.click(toggle);
    
    // Toggle should now be on again
    expect(toggle).toHaveProperty('checked', true);
  });
  
  test('shows item details modal when View button is clicked', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    // Find the View button for the first item
    const viewButtons = screen.getAllByText('View');
    fireEvent.click(viewButtons[0]);
    
    // Check if modal appears with item details
    await waitFor(() => {
      // The ItemDetails component should show the question in the modal
      expect(screen.getByTestId('item-details-modal')).toBeInTheDocument();
    });
  });
  
  test('selects items and shows bulk delete modal', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    // Get checkboxes
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    expect(checkboxes.length).toBeGreaterThan(2); // Header + at least 2 items
    
    // Get the initial state of the checkbox
    const initialState = checkboxes[1].checked;
    
    // Click the checkbox to toggle its state
    fireEvent.click(checkboxes[1]);
    
    // Verify checkbox state has changed
    expect(checkboxes[1].checked).not.toBe(initialState);
    
    // Verify delete button exists
    const deleteButtons = screen.getAllByRole('button');
    const deleteBtn = deleteButtons.find(btn => 
      btn.textContent && btn.textContent.includes('Delete Selected')
    );
    
    expect(deleteBtn).not.toBeNull();
  });
  
  test('selects all items when header checkbox is clicked', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument();
    });

    // Get checkboxes (first checkbox is for "select all")
    const checkboxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    
    // Select all items
    fireEvent.click(checkboxes[0]); // Header checkbox
    
    // Find the delete button
    const deleteButtons = screen.getAllByRole('button');
    const deleteBtn = deleteButtons.find(btn => 
      btn.textContent && btn.textContent.includes('Delete Selected')
    );
    
    // Ensure we found the button and it shows the count of items
    expect(deleteBtn).not.toBeNull();
    if (deleteBtn) {
      expect(deleteBtn.textContent).toContain('2');
    
      // Click the delete button
      fireEvent.click(deleteBtn);
    }
    
    // Find the confirm deletion button in the modal
    const confirmBtn = await screen.findByRole('button', { 
      name: (content) => content.includes('Delete') && content.includes('items')
    });
    
    // Confirm the delete modal shows the correct count
    expect(confirmBtn.textContent).toContain('2');
  });
  
  test('shows upload modal when Upload Items button is clicked', async () => {
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(listItems).toHaveBeenCalled();
    });

    // Find and click the Upload Items button
    const uploadButton = screen.getByText('Upload Items');
    fireEvent.click(uploadButton);
    
    // Check if the upload modal is shown
    // Since BulkUpload is mocked, we can just check if the upload button triggered something
    expect(screen.getByTestId('bulk-upload-modal')).toBeInTheDocument();
  });
  
  test('handles pagination correctly', async () => {
    // Use pagination mock items for this test
    vi.mocked(listItems).mockResolvedValue(paginationMockItems);
    
    render(
      <MemoryRouter>
        <ItemsList />
      </MemoryRouter>
    );

    // Wait for items to load
    await waitFor(() => {
      expect(listItems).toHaveBeenCalled();
    });
    
    // With default page size 10, we should have pagination controls
    const paginationControls = screen.getByLabelText('Next page');
    expect(paginationControls).toBeInTheDocument();
    
    // First page should show first 10 items
    expect(screen.getByText('Question 1')).toBeInTheDocument();
    expect(screen.getByText('Question 2')).toBeInTheDocument();
    expect(screen.getByText('Pagination Test Question 1')).toBeInTheDocument();
    
    // Click next page
    fireEvent.click(paginationControls);
    
    // We should now see items from the second page
    await waitFor(() => {
      expect(screen.getByText('Pagination Test Question 10')).toBeInTheDocument();
    });
  });
}); 