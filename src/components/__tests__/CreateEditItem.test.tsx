import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CreateEditItem } from '../CreateEditItem';
import { client } from '../../main';
import { vi } from 'vitest';

// Mock the client
vi.mock('../../main', () => ({
  client: {
    models: {
      Item: {
        create: vi.fn().mockResolvedValue({
          data: {
            QuestionId: 123,
            CreatedDate: '2023-01-01',
            Question: 'Test question',
            responseA: 'A',
            responseB: 'B',
            responseC: 'C',
            responseD: 'D',
            rationaleA: 'Rationale A',
            rationaleB: 'Rationale B',
            rationaleC: 'Rationale C',
            rationaleD: 'Rationale D',
            Key: 'A'
          }
        }),
        update: vi.fn().mockResolvedValue({
          data: {
            QuestionId: 123,
            CreatedDate: '2023-01-01',
            Question: 'Updated question',
            responseA: 'Updated A',
            responseB: 'Updated B',
            responseC: 'Updated C',
            responseD: 'Updated D',
            rationaleA: 'Updated Rationale A',
            rationaleB: 'Updated Rationale B',
            rationaleC: 'Updated Rationale C',
            rationaleD: 'Updated Rationale D'
          }
        }),
        list: vi.fn().mockResolvedValue({
          data: []
        }),
        get: vi.fn().mockResolvedValue({
          data: {
            QuestionId: 123,
            CreatedDate: '2023-01-01',
            Question: 'Existing question',
            responseA: 'Existing A',
            responseB: 'Existing B',
            responseC: 'Existing C',
            responseD: 'Existing D',
            responseE: 'Existing E',
            responseF: 'Existing F',
            rationaleA: 'Existing Rationale A',
            rationaleB: 'Existing Rationale B',
            rationaleC: 'Existing Rationale C',
            rationaleD: 'Existing Rationale D',
            rationaleE: 'Existing Rationale E',
            rationaleF: 'Existing Rationale F',
            Rationale: 'A',
            Key: 'A',
            Topic: 'Test Topic',
            KnowledgeSkills: 'Test Skills',
            Tags: 'test,tags',
            Type: 'MCQ',
            Status: 'Draft'
          }
        })
      }
    }
  }
}));

// Helper function to render with router
function renderWithRouter(ui: React.ReactElement, { route = '/' } = {}) {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/item" element={ui} />
        <Route path="/item/:id" element={ui} />
      </Routes>
    </MemoryRouter>
  );
}

describe('CreateEditItem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the create form with all required fields', async () => {
    renderWithRouter(<CreateEditItem />, { route: '/item' });
    
    // Check that the form renders with the correct title
    expect(screen.getByText('Create New Item')).toBeInTheDocument();
    
    // Check that the form has the required fields
    expect(screen.getByLabelText('Question')).toBeInTheDocument();
    
    // Find all TextArea components for responses and rationales
    const textAreas = screen.getAllByRole('textbox');
    expect(textAreas.length).toBeGreaterThan(1);
    
    // Check that the toggle buttons for correct answers are present
    const toggleButtons = screen.getAllByRole('checkbox');
    expect(toggleButtons.length).toBeGreaterThan(0);
    
    // Check that the save button is present
    const saveButton = screen.getByRole('button', { name: /Create item/i });
    expect(saveButton).toBeInTheDocument();
  });
  
  test('loads and displays existing item data', async () => {
    renderWithRouter(<CreateEditItem />, { route: '/item/123' });
    
    // Wait for the component to load the data
    await waitFor(() => {
      expect(client.models.Item.get).toHaveBeenCalled();
    }, { timeout: 5000 });
    
    // Verify form is populated with existing data
    await waitFor(() => {
      expect(screen.getByLabelText('Question')).toHaveValue('Existing question');
      
      // Check that the save button is present
      const saveButton = screen.getByRole('button', { name: /Save changes/i });
      expect(saveButton).toBeInTheDocument();
    }, { timeout: 5000 });
  });
  
  test('toggles can be clicked to select correct answer', async () => {
    renderWithRouter(<CreateEditItem />, { route: '/item' });
    
    // Find all toggle buttons
    const toggleButtons = screen.getAllByRole('checkbox');
    
    // Click the first toggle button
    await userEvent.click(toggleButtons[0]);
    
    // Verify the toggle is checked
    expect(toggleButtons[0]).toBeChecked();
    
    // Click the second toggle button
    await userEvent.click(toggleButtons[1]);
    
    // Verify the second toggle is checked and the first is unchecked
    expect(toggleButtons[1]).toBeChecked();
    expect(toggleButtons[0]).not.toBeChecked();
  });
});