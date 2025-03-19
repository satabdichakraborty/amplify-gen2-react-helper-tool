// Importing AWS SDK (commented out for testing)
// import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Define types for the request and response
type GenerateRationaleRequest = {
  question: string;
  responseA: string;
  responseB: string;
  responseC: string;
  responseD: string;
  responseE?: string;
  responseF?: string;
  type: 'Multiple Choice' | 'Multiple Response';
};

type GeneratedRationaleResponse = {
  llmKey: string;
  llmRationaleA: string;
  llmRationaleB: string;
  llmRationaleC: string;
  llmRationaleD: string;
  llmRationaleE?: string;
  llmRationaleF?: string;
  llmGeneralRationale: string;
};

// Create the prompt for the model
export function createPrompt(request: GenerateRationaleRequest): string {
  // Extract the question and response options
  const { question, responseA, responseB, responseC, responseD, responseE, responseF, type } = request;
  
  // Build the prompt
  let prompt = `
You are an expert in educational assessment and certification exam question analysis.

CONTEXT:
I have a ${type} question and I need you to:
1. Determine the correct answer
2. Provide a detailed explanation for why each option is correct or incorrect

QUESTION:
${question}

RESPONSE OPTIONS:
A: ${responseA}
B: ${responseB}
C: ${responseC}
D: ${responseD}
${responseE ? `E: ${responseE}\n` : ''}
${responseF ? `F: ${responseF}\n` : ''}

Please provide your analysis in the following JSON format. Do not include any other text or explanation outside the JSON:
{
  "correctAnswer": "<letter of correct answer, or comma-separated letters for multiple response>",
  "rationaleA": "<explanation for option A>",
  "rationaleB": "<explanation for option B>",
  "rationaleC": "<explanation for option C>",
  "rationaleD": "<explanation for option D>",
  ${responseE ? `"rationaleE": "<explanation for option E>",\n` : ''}
  ${responseF ? `"rationaleF": "<explanation for option F>",\n` : ''}
  "generalRationale": "<overall explanation for the correct answer>"
}
`;

  return prompt;
}

// Parse the model's response
export function parseModelResponse(responseText: string): GeneratedRationaleResponse {
  try {
    // Extract JSON content if there are any surrounding text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonContent = jsonMatch ? jsonMatch[0] : responseText;
    
    // Parse the JSON
    const parsed = JSON.parse(jsonContent);
    
    return {
      llmKey: parsed.correctAnswer || '',
      llmRationaleA: parsed.rationaleA || '',
      llmRationaleB: parsed.rationaleB || '',
      llmRationaleC: parsed.rationaleC || '',
      llmRationaleD: parsed.rationaleD || '',
      llmRationaleE: parsed.rationaleE || '',
      llmRationaleF: parsed.rationaleF || '',
      llmGeneralRationale: parsed.generalRationale || '',
    };
  } catch (error) {
    console.error('Error parsing model response:', error);
    throw new Error('Failed to parse model response');
  }
}

/**
 * A simplified version of the AWS Bedrock call for testing
 * In a real implementation, this would use actual AWS Bedrock
 */
export async function callBedrock(prompt: string): Promise<string> {
  // This is a mock implementation for testing
  // In a real implementation, this would call AWS Bedrock
  
  // Return a sample response for testing
  return JSON.stringify({
    correctAnswer: "B",
    rationaleA: "This is incorrect because it doesn't address the core issue.",
    rationaleB: "This is correct because it provides the most efficient solution.",
    rationaleC: "This is incorrect because it's not the most optimized approach.",
    rationaleD: "This is incorrect because it doesn't scale well.",
    generalRationale: "Option B is the best answer because it offers the most efficient and scalable solution."
  });
}

// Main handler function
export async function handler(event: any) {
  try {
    console.log('Received event:', JSON.stringify(event));
    
    // Parse the request
    const request: GenerateRationaleRequest = event.arguments ?? event.body ?? event;
    
    // Create the prompt
    const prompt = createPrompt(request);
    
    // Call the LLM
    const responseText = await callBedrock(prompt);
    
    // Parse the model's response
    const rationaleResponse = parseModelResponse(responseText);
    
    return {
      statusCode: 200,
      body: rationaleResponse,
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: {
        message: 'Error generating rationales',
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
} 