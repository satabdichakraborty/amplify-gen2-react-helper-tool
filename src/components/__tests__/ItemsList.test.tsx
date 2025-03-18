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
  deleteItem: vi.fn()
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
    Type: 'MCQ',
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
    Type: 'MRQ',
    Status: 'Draft',
    CreatedBy: 'system',
    Key: 'B,C',
    Topic: 'Topic 2',
    KnowledgeSkills: 'Skill 2'
  }
];

describe('ItemsList', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(listItems).mockResolvedValue(mockItems);
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
    expect(screen.getByText('MCQ')).toBeInTheDocument();
    expect(screen.getByText('MRQ')).toBeInTheDocument();
    
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
}); 