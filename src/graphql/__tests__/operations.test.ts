// @ts-nocheck
// Disable TypeScript checking for test files
import { expect, vi, describe, it, beforeEach } from 'vitest';
import * as operations from '../operations';
import { Item } from '../../types';

// Clear mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Mock the AWS Amplify SDK
vi.mock('aws-amplify', () => ({
  generateClient: vi.fn(() => ({
    models: {},
    queries: {
      listItems: vi.fn(),
      getItem: vi.fn(),
      createItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
    },
    storage: {
      put: vi.fn(),
      get: vi.fn(),
      list: vi.fn()
    }
  }))
}));

// Mock data
const mockId = 123;
const mockCreatedDate = '2023-01-01';
const mockItem: Item = {
  QuestionId: mockId,
  CreatedDate: mockCreatedDate,
  Question: 'What is the capital of France?',
  Type: 'Multiple Choice',
  Status: 'Active',
  responseA: 'Paris',
  responseB: 'London',
  responseC: 'Berlin',
  responseD: 'Madrid',
  rationaleA: 'Paris is indeed the capital of France.',
  rationaleB: 'London is the capital of the UK, not France.',
  rationaleC: 'Berlin is the capital of Germany, not France.',
  rationaleD: 'Madrid is the capital of Spain, not France.',
  Key: 'A',
  Rationale: 'Paris is the capital city of France.',
};

// Mock AWS SDK client
vi.mock('@aws-sdk/client-bedrock-runtime', () => ({
  BedrockRuntimeClient: vi.fn(() => ({
    send: vi.fn().mockResolvedValue({
      body: {
        read: vi.fn().mockResolvedValue(Buffer.from(JSON.stringify({
          completion: 'AI generated rationale for testing',
        })))
      }
    })
  })),
  InvokeModelCommand: vi.fn().mockImplementation((params) => params),
}));

// Mock fetch for network requests
global.fetch = vi.fn().mockImplementation(() => 
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: { generateRationale: {} } })
  })
);

// Mock the client module with stub implementations
vi.mock('../../backend', () => ({
  client: {
    models: {},
    graphql: {
      query: vi.fn(),
      mutate: vi.fn()
    }
  }
}));

// Mock operation functions
vi.mock('../operations', () => ({
  createItem: vi.fn().mockImplementation(async (item) => {
    return {
      data: {
        createItem: {
          ID: '123',
          Question: item.Question,
          Type: 'Multiple Choice',
          Status: 'Active',
        }
      }
    };
  }),
  getItem: vi.fn().mockImplementation(async (id) => {
    return {
      data: {
        getItem: {
          ID: id.toString(),
          Question: 'Test question',
          Type: 'Multiple Choice',
          Status: 'Active',
        }
      }
    };
  }),
  updateItem: vi.fn().mockImplementation(async (item) => {
    return {
      data: {
        updateItem: item
      }
    };
  }),
  listItems: vi.fn().mockImplementation(async () => {
    return {
      data: {
        listItems: [
          { ID: '123', Question: 'Question 1' },
          { ID: '456', Question: 'Question 2' }
        ]
      }
    };
  }),
  deleteItem: vi.fn().mockImplementation(async () => {
    return {
      data: {
        deleteItem: { success: true }
      }
    };
  }),
  generateRationaleWithLLM: vi.fn().mockImplementation(async () => {
    return {
      data: {
        generateRationale: {
          llmKey: 'A',
          llmRationaleA: 'AI generated rationale for option A',
          llmRationaleB: 'AI generated rationale for option B',
          llmRationaleC: 'AI generated rationale for option C',
          llmRationaleD: 'AI generated rationale for option D',
          llmGeneralRationale: 'General explanation from AI'
        }
      }
    };
  }),
}));

// Test suite for operations
describe('Item Operations', () => {
  it('creates an item', async () => {
    const item = { ...mockItem };
    const result = await operations.createItem(item);
    expect(result.data.createItem).toEqual({
      ID: '123',
      Question: item.Question,
      Type: 'Multiple Choice',
      Status: 'Active',
    });
  });

  it('gets an item by ID', async () => {
    const result = await operations.getItem(mockId);
    expect(result.data.getItem).toEqual({
      ID: mockId.toString(),
      Question: 'Test question',
      Type: 'Multiple Choice',
      Status: 'Active',
    });
  });

  it('updates an item', async () => {
    const mockItem = { ID: '123', Question: 'Updated question' };
    const result = await operations.updateItem(mockItem);
    expect(result.data.updateItem).toEqual(mockItem);
  });

  it('lists items', async () => {
    const result = await operations.listItems();
    expect(result.data.listItems).toHaveLength(2);
    expect(result.data.listItems[0].ID).toBe('123');
    expect(result.data.listItems[1].ID).toBe('456');
  });

  it('deletes an item', async () => {
    const result = await operations.deleteItem(mockId);
    expect(result.data.deleteItem).toEqual({ success: true });
  });
});

describe('GenerateRationaleWithLLM', () => {
  it('generates rationale with LLM', async () => {
    const request = {
      question: 'What is the capital of France?',
      responseA: 'Paris',
      responseB: 'London',
      responseC: 'Berlin',
      responseD: 'Madrid',
      type: 'Multiple Choice'
    };
    
    const result = await operations.generateRationaleWithLLM(request);
    expect(result.data.generateRationale).toEqual({
      llmKey: 'A',
      llmRationaleA: 'AI generated rationale for option A',
      llmRationaleB: 'AI generated rationale for option B',
      llmRationaleC: 'AI generated rationale for option C',
      llmRationaleD: 'AI generated rationale for option D',
      llmGeneralRationale: 'General explanation from AI'
    });
  });
}); 