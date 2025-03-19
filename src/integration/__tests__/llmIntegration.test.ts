import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { generateRationaleWithLLM } from '../../graphql/operations';

// Mock the main module
vi.mock('../../main', () => ({
  client: {
    models: {
      Item: {
        get: vi.fn(),
        create: vi.fn(),
        update: vi.fn()
      }
    }
  }
}));

// We'll also need to mock the setTimeout used in generateRationaleWithLLM
describe('LLM Integration Tests', () => {
  const mockItem = {
    QuestionId: 12345,
    CreatedDate: '2024-01-01',
    Question: 'What is AWS Lambda?',
    responseA: 'A database service',
    responseB: 'A serverless compute service',
    responseC: 'A storage service',
    responseD: 'A networking service',
    Type: 'Multiple Choice'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should properly process the request payload', async () => {
    // Since the Lambda function is mocked in the implementation itself,
    // we're just testing that the function correctly processes the input and returns expected output
    const responsePromise = generateRationaleWithLLM(mockItem);
    
    // Fast-forward timers to complete the mocked delay
    vi.runAllTimers();
    
    const response = await responsePromise;
    
    // Verify the response structure
    expect(response).toHaveProperty('llmKey');
    expect(response).toHaveProperty('llmRationaleA');
    expect(response).toHaveProperty('llmRationaleB');
    expect(response).toHaveProperty('llmRationaleC');
    expect(response).toHaveProperty('llmRationaleD');
    expect(response).toHaveProperty('llmGeneralRationale');
  });

  it('should include all provided responses in the payload', async () => {
    const multipleResponseItem = {
      ...mockItem,
      Type: 'Multiple Response',
      responseE: 'AWS AppSync'
    };
    
    // We'll spy on console.log to verify the payload
    const logSpy = vi.spyOn(console, 'log');
    const responsePromise = generateRationaleWithLLM(multipleResponseItem);
    
    // Fast-forward timers to complete the mocked delay
    vi.runAllTimers();
    
    await responsePromise;
    
    // Verify the payload included responseE
    expect(logSpy).toHaveBeenCalledWith(
      'Simulating Lambda call with payload:',
      expect.objectContaining({
        responseE: 'AWS AppSync',
        type: 'Multiple Response'
      })
    );
  });
}); 