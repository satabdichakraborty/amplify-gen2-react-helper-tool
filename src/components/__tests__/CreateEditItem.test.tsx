import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CreateEditItem } from '../CreateEditItem';
import { vi } from 'vitest';

// Mock the router navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock API functions
const mockGetList = vi.fn();
const mockGet = vi.fn();
const mockCreate = vi.fn();
const mockUpdate = vi.fn();

// Mock the client and operations
vi.mock('../../main', () => ({
  client: {
    models: {
      Item: {
        get: (...args: any[]) => mockGet(...args),
        create: (...args: any[]) => mockCreate(...args),
        update: (...args: any[]) => mockUpdate(...args),
      },
    }
  }
}));

vi.mock('../../graphql/operations', () => ({
  listItems: (...args: any[]) => mockGetList(...args),
}));

describe('CreateEditItem', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    
    // Default mock implementations
    mockGetList.mockResolvedValue([
      { QuestionId: 123, CreatedDate: '2023-01-01' }
    ]);
    
    mockGet.mockResolvedValue({
      data: {
        QuestionId: 123,
        CreatedDate: '2023-01-01',
        Question: 'Test question',
        Type: 'MCQ',
        responseA: 'Option A',
        responseB: 'Option B', 
        responseC: 'Option C',
        responseD: 'Option D',
        Key: 'A',
        Status: 'Draft'
      }
    });
    
    // Set successful response for create/update and navigate to homepage afterward
    mockCreate.mockImplementation(() => {
      mockNavigate('/');
      return Promise.resolve({});
    });
    
    mockUpdate.mockImplementation(() => {
      mockNavigate('/');
      return Promise.resolve({});
    });
  });

  // Simple render helper
  const renderComponent = (path = '/items/create') => {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/items/create" element={<CreateEditItem />} />
          <Route path="/items/edit/:id" element={<CreateEditItem />} />
          <Route path="/" element={<div>Home page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  test('renders create form', async () => {
    renderComponent();
    
    // Verify heading appears
    expect(await screen.findByRole('heading', { level: 1, name: /Create New Item/i })).toBeInTheDocument();
  });

  test('renders edit form', async () => {
    renderComponent('/items/edit/123');
    
    // Verify heading appears
    expect(await screen.findByRole('heading', { level: 1, name: /Edit Item/i })).toBeInTheDocument();
  });
});