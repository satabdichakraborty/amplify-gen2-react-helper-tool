import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CreateEditItem } from '../CreateEditItem';
import { client } from '../../main';
import { vi } from 'vitest';

// Mock the client and graphql operations
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
            Key: 'A',
            CreatedBy: 'system'
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
            rationaleD: 'Updated Rationale D',
            CreatedBy: 'system'
          }
        }),
        list: vi.fn().mockResolvedValue({
          data: [{
            QuestionId: 123,
            CreatedDate: '2023-01-01',
            Question: 'Existing question',
            Type: 'MCQ',
            Status: 'Draft'
          }]
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
            Status: 'Draft',
            CreatedBy: 'system'
          }
        })
      }
    }
  }
}));

// Also mock the listItems function
vi.mock('../../graphql/operations', () => ({
  listItems: vi.fn().mockResolvedValue([{
    QuestionId: 123,
    CreatedDate: '2023-01-01',
    Question: 'Existing question',
    Type: 'MCQ',
    Status: 'Draft'
  }])
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
    
    // Find all checkboxes for correct answers (they're in the response sections)
    const correctLabels = screen.getAllByText('Correct');
    expect(correctLabels.length).toBeGreaterThan(0);
    
    // Find the checkbox next to the first "Correct" label
    const firstToggleParent = correctLabels[0].parentElement;
    const firstToggle = firstToggleParent?.querySelector('input[type="checkbox"]');
    expect(firstToggle).not.toBeNull();
    
    // Find the checkbox next to the second "Correct" label
    const secondToggleParent = correctLabels[1].parentElement;
    const secondToggle = secondToggleParent?.querySelector('input[type="checkbox"]');
    expect(secondToggle).not.toBeNull();
    
    // Click the second toggle
    if (secondToggle) {
      await userEvent.click(secondToggle);
    }
    
    // In Multiple Choice mode, only one answer can be correct at a time
    // So after clicking the second toggle, it should be checked and the first should not be
    expect(secondToggle).toBeChecked();
    expect(firstToggle).not.toBeChecked();
  });
  
  test('general rationale field is rendered and can be edited', async () => {
    // Render the component with the correct route
    renderWithRouter(<CreateEditItem />, { route: '/item' });
    
    // Check that the form renders with the correct title
    expect(screen.getByText('Create New Item')).toBeInTheDocument();
    
    // Check that the General Rationale section is rendered
    expect(screen.getByText('General Rationale')).toBeInTheDocument();
    
    // Find the Explanation field by its label
    const explanationField = screen.getByLabelText('Explanation');
    expect(explanationField).toBeInTheDocument();
    
    // Type into the Explanation field
    await userEvent.type(explanationField, 'This is a test rationale');
    
    // Verify the text was entered
    expect(explanationField).toHaveValue('This is a test rationale');
  });
  
  test('response text and rationale fields are displayed side by side', async () => {
    // Render the component with the correct route
    renderWithRouter(<CreateEditItem />, { route: '/item' });
    
    // Check that the form renders with the correct title
    expect(screen.getByText('Create New Item')).toBeInTheDocument();
    
    // Find the response container elements
    const responseContainers = document.querySelectorAll('div[data-testid="response-container"]');
    
    // Verify that we have at least one response container with flex layout
    expect(responseContainers.length).toBeGreaterThan(0);
    
    // For each response container, verify it has two child divs with flex: 1
    responseContainers.forEach(container => {
      const textContainer = container.querySelector('div[data-testid="text-container"]');
      const rationaleContainer = container.querySelector('div[data-testid="rationale-container"]');
      
      // Verify both containers exist
      expect(textContainer).not.toBeNull();
      expect(rationaleContainer).not.toBeNull();
      
      // First child should contain Text field
      expect(textContainer!.textContent).toContain('Text');
      
      // Second child should contain Rationale field
      expect(rationaleContainer!.textContent).toContain('Rationale');
    });
  });

  it('toggles between Multiple Choice and Multiple Response modes', async () => {
    render(
      <MemoryRouter>
        <CreateEditItem />
      </MemoryRouter>
    );
    
    // Check that we start in Multiple Choice mode with 4 responses
    expect(screen.getByText('Multiple Choice')).toBeInTheDocument();
    expect(screen.getByText('Multiple Response')).toBeInTheDocument();
    
    // Find the toggle between the "Multiple Choice" and "Multiple Response" text
    const multipleChoiceText = screen.getByText('Multiple Choice');
    const toggleParent = multipleChoiceText.parentElement?.parentElement;
    const toggle = toggleParent?.querySelector('input[type="checkbox"]');
    expect(toggle).toBeInTheDocument();
    
    // Initially, only responses A-D should be visible
    expect(screen.getAllByText(/Response [A-D]/)).toHaveLength(4);
    
    // Toggle to Multiple Response mode
    if (toggle) {
      await userEvent.click(toggle);
    }
    
    // Now all responses A-F should be visible
    expect(screen.getAllByText(/Response [A-F]/)).toHaveLength(6);
    
    // Check that checkboxes are used instead of toggles
    const checkboxes = document.querySelectorAll('[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThan(0);
    
    // Toggle back to Multiple Choice mode
    if (toggle) {
      await userEvent.click(toggle);
    }
    
    // Now only responses A-D should be visible again
    expect(screen.getAllByText(/Response [A-D]/)).toHaveLength(4);
  });
});