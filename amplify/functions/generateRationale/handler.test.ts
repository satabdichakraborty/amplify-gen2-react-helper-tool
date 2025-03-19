import { expect, test, describe } from 'vitest';
import { createPrompt, parseModelResponse } from './handler';

describe('LLM Rationale Generator', () => {
  test('createPrompt formats request correctly for multiple choice', () => {
    const request = {
      question: 'Test question?',
      responseA: 'Option A',
      responseB: 'Option B',
      responseC: 'Option C',
      responseD: 'Option D',
      type: 'Multiple Choice' as const
    };

    const prompt = createPrompt(request);
    expect(prompt).toContain('Test question?');
    expect(prompt).toContain('A: Option A');
    expect(prompt).toContain('B: Option B');
    expect(prompt).toContain('C: Option C');
    expect(prompt).toContain('D: Option D');
  });

  test('parseModelResponse correctly extracts values', () => {
    const mockResponse = JSON.stringify({
      correctAnswer: "C",
      rationaleA: "Rationale for A",
      rationaleB: "Rationale for B",
      rationaleC: "Rationale for C",
      rationaleD: "Rationale for D",
      generalRationale: "General explanation"
    });

    const result = parseModelResponse(mockResponse);
    expect(result.llmKey).toBe("C");
    expect(result.llmRationaleA).toBe("Rationale for A");
    expect(result.llmRationaleB).toBe("Rationale for B");
    expect(result.llmRationaleC).toBe("Rationale for C");
    expect(result.llmRationaleD).toBe("Rationale for D");
    expect(result.llmGeneralRationale).toBe("General explanation");
  });
}); 