import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../amplify/data/resource';

const client = generateClient<Schema>();

// Default prompts
const defaultPrompts = {
  'rationale-system-prompt': {
    name: 'rationale-system-prompt',
    content: `You are an expert in educational assessment and certification exam question analysis. You are an AWS expert and have a deep understanding of AWS services and their capabilities.

Your task is to analyze AWS certification questions and provide detailed explanations for each option.`,
    description: 'System prompt for the rationale generation system',
    version: 1
  },
  'rationale-user-template': {
    name: 'rationale-user-template',
    content: `CONTEXT:
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
}`,
    description: 'Template for user-specific prompts',
    version: 1
  }
};

// Function to create or update a prompt
async function upsertPrompt(prompt: {
  name: string;
  content: string;
  description: string;
  version: number;
}) {
  try {
    console.log(`Upserting prompt: ${prompt.name}`);
    
    // Try to get existing prompt
    const { data: existingPrompt } = await client.models.Prompt.get({
      name: prompt.name
    });

    if (existingPrompt) {
      // Update existing prompt
      const updatedPrompt = await client.models.Prompt.update({
        name: prompt.name,
        content: prompt.content,
        description: prompt.description,
        version: existingPrompt.version + 1
      });
      console.log(`Updated prompt: ${prompt.name}`, updatedPrompt);
    } else {
      // Create new prompt
      const newPrompt = await client.models.Prompt.create(prompt);
      console.log(`Created new prompt: ${prompt.name}`, newPrompt);
    }
  } catch (error) {
    console.error(`Error upserting prompt ${prompt.name}:`, error);
    throw error;
  }
}

// Function to list all prompts
async function listPrompts() {
  try {
    const { data: prompts } = await client.models.Prompt.list();
    console.log('Current prompts:', prompts);
    return prompts;
  } catch (error) {
    console.error('Error listing prompts:', error);
    throw error;
  }
}

// Function to delete a prompt
async function deletePrompt(name: string) {
  try {
    await client.models.Prompt.delete({ name });
    console.log(`Deleted prompt: ${name}`);
  } catch (error) {
    console.error(`Error deleting prompt ${name}:`, error);
    throw error;
  }
}

// Main function to initialize prompts
async function initializePrompts() {
  try {
    console.log('Initializing prompts...');
    
    // Create/update all default prompts
    for (const prompt of Object.values(defaultPrompts)) {
      await upsertPrompt(prompt);
    }
    
    // List all prompts
    await listPrompts();
    
    console.log('Prompt initialization complete');
  } catch (error) {
    console.error('Error initializing prompts:', error);
    process.exit(1);
  }
}

// Export functions for use in other scripts
export {
  upsertPrompt,
  listPrompts,
  deletePrompt,
  initializePrompts
};

// Run initialization if this script is run directly
if (require.main === module) {
  initializePrompts();
} 