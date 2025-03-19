import { describe, test, expect, vi, beforeEach } from 'vitest';
import { createPrompt, parseModelResponse, callBedrock, handler, type GeneratedRationaleResponse, type LambdaEvent } from './handler';

// Mock the AWS SDK with a properly formatted Claude 3.7 Sonnet response
vi.mock('@aws-sdk/client-bedrock-runtime', async () => {
  const mockResponseBody = {
    id: "msg_0123456789abcdef",
    type: "message",
    role: "assistant",
    model: "anthropic.claude-3-7-sonnet-20240620-v1:0",
    content: [
      {
        type: "text",
        text: JSON.stringify({
          correctAnswer: "C",
          rationaleA: "This option is incorrect because of reason A.",
          rationaleB: "This option is incorrect because of reason B.",
          rationaleC: "This option is correct because of reason C.",
          rationaleD: "This option is incorrect because of reason D.",
          generalRationale: "Option C is the correct answer because it properly addresses the question."
        })
      }
    ],
    stop_sequence: null,
    stop_reason: "end_turn",
    usage: {
      input_tokens: 150,
      output_tokens: 200
    }
  };

  return {
    BedrockRuntimeClient: vi.fn(() => ({
      send: vi.fn().mockResolvedValue({
        body: new TextEncoder().encode(JSON.stringify(mockResponseBody))
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
    
    // Import the mocked module
    const bedrockModule = await import('@aws-sdk/client-bedrock-runtime');
    
    // Verify Bedrock client was initialized
    expect(bedrockModule.BedrockRuntimeClient).toHaveBeenCalled();
    
    // Verify InvokeModelCommand was called with the correct model ID
    expect(bedrockModule.InvokeModelCommand).toHaveBeenCalledWith(expect.objectContaining({
      modelId: 'anthropic.claude-3-7-sonnet-20240620-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: expect.any(String)
    }));
    
    // Get the most recent call arguments to InvokeModelCommand constructor
    const mockCalls = bedrockModule.InvokeModelCommand['mock'].calls;
    expect(mockCalls.length).toBeGreaterThan(0);
    
    const mostRecentCall = mockCalls[0][0];
    const requestBody = JSON.parse(mostRecentCall.body);
    expect(requestBody.messages[0].role).toBe("user");
    expect(requestBody.messages[0].content).toBe(prompt);
    expect(requestBody.anthropic_version).toBe("bedrock-2023-05-31");
    
    // Verify the response is parsed correctly
    const parsedResponse = JSON.parse(response);
    expect(parsedResponse.correctAnswer).toBe("C");
  });

  test('handler correctly processes events', async () => {
    // Create the event with the proper type annotation
    const event: LambdaEvent = {
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
    // Type assertion to ensure TypeScript knows body has llmKey property
    const body = result.body as GeneratedRationaleResponse;
    expect(body.llmKey).toBe("C");
  });
}); 