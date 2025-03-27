// Importing AWS SDK for Bedrock
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';

// Define types for the request and response
export type GenerateRationaleRequest = {
  question: string;
  responseA: string;
  responseB: string;
  responseC: string;
  responseD: string;
  responseE?: string;
  responseF?: string;
  type: 'Multiple Choice' | 'Multiple Response';
};

export type GeneratedRationaleResponse = {
  llmKey: string;
  llmRationaleA: string;
  llmRationaleB: string;
  llmRationaleC: string;
  llmRationaleD: string;
  llmRationaleE?: string;
  llmRationaleF?: string;
  llmGeneralRationale: string;
};

// Type definition for Lambda event
export interface LambdaEvent {
  arguments?: {
    question: string;
    responseA: string;
    responseB: string;
    responseC: string;
    responseD: string;
    responseE?: string;
    responseF?: string;
    type: string;
  };
  body?: {
    question: string;
    responseA: string;
    responseB: string;
    responseC: string;
    responseD: string;
    responseE?: string;
    responseF?: string;
    type: string;
  };
  [key: string]: any;
}

// Create the prompt for the model
export function createPrompt(request: GenerateRationaleRequest): string {
  // Extract the question and response options
  const { question, responseA, responseB, responseC, responseD, responseE, responseF, type } = request;
  
  // Build the prompt
  let prompt = `
You are an expert in educational assessment and certification exam question analysis. You are an AWS expert and have a deep understanding of AWS services and their capabilities.

CONTEXT:
I have a ${type} question and I need you to:
1. Determine the correct answer or answers. Provide AWS Documentation link for the correct answer(s).
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
 * Call AWS Bedrock with Claude 3.7 Sonnet
 */
export async function callBedrock(prompt: string): Promise<string> {
  try {
    // Initialize the Bedrock client
    const client = new BedrockRuntimeClient({ region: 'us-east-1' }); // Change region if needed
    
    // Claude 3.7 Sonnet model ID
    const MODEL_ID = 'anthropic.claude-3-7-sonnet-20240620-v1:0';
    
    // Prepare the request body for Claude 3.7 Sonnet
    const requestBody = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4096,
      temperature: 0.2,
      system: "You are an expert in educational assessment and certification exam question analysis. Respond with valid JSON only.",
      messages: [
        {
          role: "user", 
          content: prompt
        }
      ]
    };
    
    // Log the request to Bedrock
    console.log('Bedrock Request:', JSON.stringify({
      modelId: MODEL_ID,
      requestBody: {
        ...requestBody,
        messages: requestBody.messages.map(msg => ({
          ...msg,
          content: msg.content.substring(0, 100) + '...' // Log only first 100 chars of prompt
        }))
      }
    }, null, 2));
    
    // Create the command
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify(requestBody)
    });
    
    // Send the request
    const response = await client.send(command);
    
    // Parse the response
    const responseBody = new TextDecoder().decode(response.body);
    const parsedResponse = JSON.parse(responseBody);
    
    // Log the raw response from Bedrock
    console.log('Bedrock Raw Response:', JSON.stringify(parsedResponse, null, 2));
    
    // Claude 3.7 response format has content in the message
    if (parsedResponse && parsedResponse.content && Array.isArray(parsedResponse.content)) {
      // Find the text content - Claude 3.7 returns content as an array of different types
      const textContent = parsedResponse.content.find((item: { type: string; text?: string }) => item.type === 'text');
      if (textContent && textContent.text) {
        return textContent.text;
      }
    }
    
    // If we can't find the expected format, return the whole response as a string
    console.log('Unexpected response format from Claude 3.7:', parsedResponse);
    return responseBody;
    
  } catch (error) {
    console.error('Error calling Bedrock:', error);
    
    // For development/testing: return mock data when Bedrock call fails
    console.log('Using mock response due to Bedrock error');
    return JSON.stringify({
      correctAnswer: "B",
      rationaleA: "This is incorrect because it doesn't address the core issue.",
      rationaleB: "This is correct because it provides the most efficient solution.",
      rationaleC: "This is incorrect because it's not the most optimized approach.",
      rationaleD: "This is incorrect because it doesn't scale well.",
      generalRationale: "Option B is the best answer because it offers the most efficient and scalable solution."
    });
  }
}

// Main handler function
export async function handler(event: LambdaEvent) {
  try {
    // Log the incoming event
    console.log('Lambda Event:', JSON.stringify(event, null, 2));
    
    // Extract request data from event
    let requestData: GenerateRationaleRequest;
    
    if (event.arguments) {
      // Make sure the type is properly converted to the expected string literal type
      requestData = {
        question: event.arguments.question,
        responseA: event.arguments.responseA,
        responseB: event.arguments.responseB,
        responseC: event.arguments.responseC,
        responseD: event.arguments.responseD,
        responseE: event.arguments.responseE,
        responseF: event.arguments.responseF,
        type: event.arguments.type as 'Multiple Choice' | 'Multiple Response'
      };
    } else if (event.body) {
      requestData = {
        question: event.body.question,
        responseA: event.body.responseA,
        responseB: event.body.responseB,
        responseC: event.body.responseC,
        responseD: event.body.responseD,
        responseE: event.body.responseE,
        responseF: event.body.responseF,
        type: event.body.type as 'Multiple Choice' | 'Multiple Response'
      };
    } else {
      // Fallback to the event itself, but this requires type assertion
      requestData = event as unknown as GenerateRationaleRequest;
    }
    
    // Log the extracted request data
    console.log('Extracted Request Data:', JSON.stringify(requestData, null, 2));
    
    // Create the prompt
    const prompt = createPrompt(requestData);
    
    // Log the generated prompt
    console.log('Generated Prompt:', prompt);
    
    // Call the LLM
    const responseText = await callBedrock(prompt);
    
    // Log the raw response from the LLM
    console.log('LLM Raw Response:', responseText);
    
    // Parse the model's response
    const rationaleResponse = parseModelResponse(responseText);
    
    // Log the parsed response
    console.log('Parsed Rationale Response:', JSON.stringify(rationaleResponse, null, 2));
    
    return {
      statusCode: 200,
      body: rationaleResponse,
    };
  } catch (error) {
    console.error('Error in handler:', error);
    return {
      statusCode: 500,
      body: {
        message: 'Error generating rationales',
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
} 
