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
        create: vi.fn().mockImplementation(() => {
          return Promise.resolve({
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
              rationaleD: 'Rationale D'
            }
          });
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
          data: [
            {
              QuestionId: 123,
              CreatedDate: '2023-01-01',
              Question: 'Existing question',
              responseA: 'Existing A',
              responseB: 'Existing B',
              responseC: 'Existing C',
              responseD: 'Existing D',
              rationaleA: 'Existing Rationale A',
              rationaleB: 'Existing Rationale B',
              rationaleC: 'Existing Rationale C',
              rationaleD: 'Existing Rationale D',
              Type: 'MCQ',
              Status: 'Draft'
            }
          ]
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

  test.skip('successfully creates a new item', async () => {
    // Mock the client.models.Item.create function
    const createSpy = vi.fn().mockResolvedValue({
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
        rationaleD: 'Rationale D'
      }
    });
    
    // Override the mock for this test
    vi.mocked(client.models.Item.create).mockImplementation(createSpy);
    
    renderWithRouter(<CreateEditItem />, { route: '/item' });
    
    // Fill in the form with minimum required fields
    const questionInput = screen.getByLabelText('Question');
    await userEvent.type(questionInput, 'Test question');
    
    // Fill in responses
    const responseAInput = screen.getByLabelText('Response A');
    await userEvent.type(responseAInput, 'A');
    
    const responseBInput = screen.getByLabelText('Response B');
    await userEvent.type(responseBInput, 'B');
    
    const responseCInput = screen.getByLabelText('Response C');
    await userEvent.type(responseCInput, 'C');
    
    const responseDInput = screen.getByLabelText('Response D');
    await userEvent.type(responseDInput, 'D');
    
    // Fill in rationales
    const rationaleAInput = screen.getByLabelText('Rationale A');
    await userEvent.type(rationaleAInput, 'Rationale A');
    
    const rationaleBInput = screen.getByLabelText('Rationale B');
    await userEvent.type(rationaleBInput, 'Rationale B');
    
    const rationaleCInput = screen.getByLabelText('Rationale C');
    await userEvent.type(rationaleCInput, 'Rationale C');
    
    const rationaleDInput = screen.getByLabelText('Rationale D');
    await userEvent.type(rationaleDInput, 'Rationale D');
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: /create item/i });
    await userEvent.click(saveButton);
    
    // Verify the API was called with the correct data
    await waitFor(() => {
      expect(createSpy).toHaveBeenCalled();
    });
    
    // Verify navigation occurred
    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  }, 10000);
  
  test.skip('handles API errors gracefully', async () => {
    // Mock the API to reject
    const createSpy = vi.fn().mockRejectedValueOnce(new Error('API Error'));
    
    // Override the mock for this test
    vi.mocked(client.models.Item.create).mockImplementation(createSpy);
    
    renderWithRouter(<CreateEditItem />, { route: '/item' });
    
    // Fill in the form with minimum required fields
    const questionInput = screen.getByLabelText('Question');
    await userEvent.type(questionInput, 'Test question');
    
    // Fill in responses
    const responseAInput = screen.getByLabelText('Response A');
    await userEvent.type(responseAInput, 'A');
    
    const responseBInput = screen.getByLabelText('Response B');
    await userEvent.type(responseBInput, 'B');
    
    const responseCInput = screen.getByLabelText('Response C');
    await userEvent.type(responseCInput, 'C');
    
    const responseDInput = screen.getByLabelText('Response D');
    await userEvent.type(responseDInput, 'D');
    
    // Fill in rationales
    const rationaleAInput = screen.getByLabelText('Rationale A');
    await userEvent.type(rationaleAInput, 'Rationale A');
    
    const rationaleBInput = screen.getByLabelText('Rationale B');
    await userEvent.type(rationaleBInput, 'Rationale B');
    
    const rationaleCInput = screen.getByLabelText('Rationale C');
    await userEvent.type(rationaleCInput, 'Rationale C');
    
    const rationaleDInput = screen.getByLabelText('Rationale D');
    await userEvent.type(rationaleDInput, 'Rationale D');
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: /create item/i });
    await userEvent.click(saveButton);
    
    // Verify error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/Error saving item/i)).toBeInTheDocument();
    });
  }, 10000);
  
  test('loads and updates existing item', async () => {
    renderWithRouter(<CreateEditItem />, { route: '/item/123' });
    
    // Wait for the component to load the data
    await waitFor(() => {
      expect(client.models.Item.get).toHaveBeenCalled();
    }, { timeout: 5000 });
    
    // Verify form is populated with existing data
    await waitFor(() => {
      expect(screen.getByLabelText('Question')).toHaveValue('Existing question');
      expect(screen.getByLabelText('Response A')).toHaveValue('Existing A');
      expect(screen.getByLabelText('Response B')).toHaveValue('Existing B');
      expect(screen.getByLabelText('Response C')).toHaveValue('Existing C');
      expect(screen.getByLabelText('Response D')).toHaveValue('Existing D');
      expect(screen.getByLabelText('Rationale A')).toHaveValue('Existing Rationale A');
      expect(screen.getByLabelText('Rationale B')).toHaveValue('Existing Rationale B');
      expect(screen.getByLabelText('Rationale C')).toHaveValue('Existing Rationale C');
      expect(screen.getByLabelText('Rationale D')).toHaveValue('Existing Rationale D');
    }, { timeout: 5000 });
    
    // Update a field
    const questionInput = screen.getByLabelText('Question');
    await userEvent.clear(questionInput);
    await userEvent.type(questionInput, 'Updated question');
    
    // Submit the form
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    await userEvent.click(saveButton);
    
    // Verify the API was called with the correct data
    await waitFor(() => {
      expect(client.models.Item.update).toHaveBeenCalled();
    });
    
    // Verify navigation occurred
    await waitFor(() => {
      expect(screen.getByText('Home Page')).toBeInTheDocument();
    });
  }, 10000);
});