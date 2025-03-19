import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

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

type GenerateRationaleResponse = {
  llmKey: string;
  llmRationaleA: string;
  llmRationaleB: string;
  llmRationaleC: string;
  llmRationaleD: string;
  llmRationaleE?: string;
  llmRationaleF?: string;
  llmGeneralRationale: string;
};

// Create the Bedrock client
const bedrockClient = new BedrockRuntimeClient({
  region: 'us-east-1', // Change to your desired region
});

// Helper function to create the prompt for the model
function createPrompt(request: GenerateRationaleRequest): string {
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

// Helper function to parse the model's response
function parseModelResponse(responseText: string): GenerateRationaleResponse {
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

// Main handler function
export async function handler(event: any) {
  try {
    console.log('Received event:', JSON.stringify(event));
    
    // Parse the request
    const request: GenerateRationaleRequest = event.arguments ?? event.body ?? event;
    
    // Create the prompt
    const prompt = createPrompt(request);
    
    // Call Claude 3 Sonnet via Bedrock
    const response = await bedrockClient.send(
      new InvokeModelCommand({
        modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 4096,
          temperature: 0.1,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      })
    );
    
    // Parse the response body
    const responseBody = JSON.parse(
      Buffer.from(response.body).toString('utf8')
    );
    
    // Extract the model's response text
    const responseText = responseBody.content[0].text;
    
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