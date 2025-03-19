import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createPrompt, parseModelResponse, callBedrock, handler } from './handler';

// Mock the AWS SDK
vi.mock('@aws-sdk/client-bedrock-runtime', () => {
  return {
    BedrockRuntimeClient: vi.fn(() => ({
      send: vi.fn().mockResolvedValue({
        body: new TextEncoder().encode(JSON.stringify({
          content: [
            {
              text: JSON.stringify({
                correctAnswer: "C",
                rationaleA: "This option is incorrect because of reason A.",
                rationaleB: "This option is incorrect because of reason B.",
                rationaleC: "This option is correct because of reason C.",
                rationaleD: "This option is incorrect because of reason D.",
                generalRationale: "Option C is the correct answer because it properly addresses the question."
              })
            }
          ]
        }))
      })
    })),
    InvokeModelCommand: vi.fn((params) => params)
  };
});

describe('generateRationale Lambda', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('createPrompt generates correct prompt format', () => {
    const request = {
      question: 'What is the capital of France?',
      responseA: 'London',
      responseB: 'Berlin',
      responseC: 'Paris',
      responseD: 'Madrid',
      type: 'Multiple Choice' as const
    };

    const prompt = createPrompt(request);
    
    expect(prompt).toContain('QUESTION:');
    expect(prompt).toContain('What is the capital of France?');
    expect(prompt).toContain('A: London');
    expect(prompt).toContain('B: Berlin');
    expect(prompt).toContain('C: Paris');
    expect(prompt).toContain('D: Madrid');
    expect(prompt).toContain('Multiple Choice');
  });

  test('parseModelResponse correctly parses Claude output', () => {
    const modelResponse = JSON.stringify({
      correctAnswer: "C",
      rationaleA: "London is the capital of the UK, not France.",
      rationaleB: "Berlin is the capital of Germany, not France.",
      rationaleC: "Paris is the capital of France.",
      rationaleD: "Madrid is the capital of Spain, not France.",
      generalRationale: "Paris is the capital and largest city of France."
    });

    const parsed = parseModelResponse(modelResponse);
    
    expect(parsed.llmKey).toBe("C");
    expect(parsed.llmRationaleA).toContain("London is the capital of the UK");
    expect(parsed.llmRationaleC).toContain("Paris is the capital of France");
    expect(parsed.llmGeneralRationale).toContain("Paris is the capital and largest city");
  });

  test('callBedrock calls the Bedrock API with Claude 3.7 Sonnet', async () => {
    const prompt = "Test prompt";
    const response = await callBedrock(prompt);
    
    // Verify the response is parsed correctly
    const parsedResponse = JSON.parse(response);
    expect(parsedResponse.correctAnswer).toBe("C");
  });

  test('handler correctly processes events', async () => {
    const event = {
      arguments: {
        question: 'What is the capital of France?',
        responseA: 'London',
        responseB: 'Berlin',
        responseC: 'Paris',
        responseD: 'Madrid',
        type: 'Multiple Choice'
      }
    };

    const result = await handler(event);
    
    expect(result.statusCode).toBe(200);
    expect(result.body).toBeDefined();
    expect(result.body.llmKey).toBe("C");
  });
}); 