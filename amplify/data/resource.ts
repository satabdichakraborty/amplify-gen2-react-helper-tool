import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates a database table for storing question data.
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
    .identifier(['QuestionId', 'CreatedDate'])
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
=========================================================================*/
