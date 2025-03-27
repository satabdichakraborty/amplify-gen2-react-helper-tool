import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates database tables for storing question data and LLM prompts.
=========================================================================*/
const schema = a.schema({
  Item: a
    .model({
      QuestionId: a.integer().required(),  // Partition key
      CreatedDate: a.string().required(), // Sort key
      Question: a.string().required(),    // The question text
      responseA: a.string().required(),   // Option A text
      rationaleA: a.string(),             // Explanation for option A (Optional)
      responseB: a.string().required(),   // Option B text
      rationaleB: a.string(),             // Explanation for option B (Optional)
      responseC: a.string().required(),   // Option C text
      rationaleC: a.string(),             // Explanation for option C (Optional)
      responseD: a.string().required(),   // Option D text
      rationaleD: a.string(),             // Explanation for option D (Optional)
      responseE: a.string(),              // Option E text (Optional)
      responseF: a.string(),              // Option F text (Optional)
      responseG: a.string(),              // Option G text (Optional)
      responseH: a.string(),              // Option H text (Optional)
      rationaleE: a.string(),             // Explanation for option E (Optional)
      rationaleF: a.string(),             // Explanation for option F (Optional)
      rationaleG: a.string(),             // Explanation for option G (Optional)
      rationaleH: a.string(),             // Explanation for option H (Optional)
      Key: a.string(),                    // Correct answer (A, B, C, D, E, F, G, or H)
      Rationale: a.string(),              // General rationale for the question
      // New LLM-generated fields
      LLMKey: a.string(),                 // AI-predicted correct answer
      LLMRationaleA: a.string(),          // AI-generated explanation for A
      LLMRationaleB: a.string(),          // AI-generated explanation for B
      LLMRationaleC: a.string(),          // AI-generated explanation for C
      LLMRationaleD: a.string(),          // AI-generated explanation for D
      LLMRationaleE: a.string(),          // AI-generated explanation for E (if present)
      LLMRationaleF: a.string(),          // AI-generated explanation for F (if present)
      LLMGeneralRationale: a.string(),    // AI-generated general explanation
      Topic: a.string(),                  // Topic category
      KnowledgeSkills: a.string(),        // Knowledge/skills tested
      Tags: a.string(),                   // Tags for searching/filtering
      Type: a.string(),                   // Question type (Multiple Choice, Multiple Response, etc.)
      Status: a.string(),                 // Status of the item (Active, Draft, etc.)
      CreatedBy: a.string(),              // User who created the item
      createdAt: a.datetime(),
      updatedAt: a.datetime()
    })
    .authorization((allow) => [allow.publicApiKey()])
    .identifier(['QuestionId', 'CreatedDate']),

  Prompt: a
    .model({
      name: a.string().required(),        // The name/key of the prompt
      content: a.string().required(),     // The actual prompt text
      description: a.string(),            // Optional description of the prompt's purpose
      version: a.integer(),               // Optional version number for tracking changes
      createdAt: a.datetime(),
      updatedAt: a.datetime()
    })
    .authorization((allow) => [
      allow.publicApiKey(),               // Allow Lambda functions to access
      allow.authenticated(),              // Allow authenticated users
      allow.guest()                       // Allow unauthenticated users
    ])
    .identifier(['name'])                 // Use name as the primary key
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
    // Enable user authentication
    userPoolAuthorizationMode: {
      userPoolId: process.env.USER_POOL_ID,
      userPoolClientId: process.env.USER_POOL_CLIENT_ID,
    },
  },
});

/*== STEP 2 ===============================================================
To interact with the table from your frontend code, generate a Data 
client using the following code:

"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUD operations
=========================================================================*/

/*== STEP 3 ===============================================================
Example usage in a React component:

// List all items
const { data: items } = await client.models.Item.list()

// Get a specific item
const { data: item } = await client.models.Item.get({
  QuestionId: 123,
  CreatedDate: "2024-03-14"
})

// Create a new item
const newItem = await client.models.Item.create({
  QuestionId: 123,
  CreatedDate: new Date().toISOString(),
  Question: "What is...",
  responseA: "Option A",
  rationaleA: "Because...",
  // ... other required fields
})

// Delete an item
await client.models.Item.delete({
  QuestionId: 123,
  CreatedDate: "2024-03-14"
})

// Prompt Management Examples:
// Get a specific prompt
const { data: prompt } = await client.models.Prompt.get({
  name: "rationale-system-prompt"
})

// Create a new prompt
const newPrompt = await client.models.Prompt.create({
  name: "rationale-system-prompt",
  content: "You are an expert in...",
  description: "System prompt for generating rationales",
  version: 1
})

// Update a prompt
const updatedPrompt = await client.models.Prompt.update({
  name: "rationale-system-prompt",
  content: "Updated prompt content...",
  version: 2
})
=========================================================================*/
