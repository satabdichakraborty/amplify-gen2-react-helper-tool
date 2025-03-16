import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates an Item database table for storing question data.
Each item represents a question with multiple choice responses and rationales.
The table uses QuestionId as the partition key and CreatedDate as the sort key.
The authorization rule specifies that any user with an API key can perform
CRUD operations on the Item records.
=========================================================================*/
const schema = a.schema({
  Item: a
    .model({
      QuestionId: a.string().required(),     // Partition key
      Type: a.string().required(),           // Question type
      Status: a.string().required(),         // Question status
      Question: a.string().required(),       // The question text
      Key: a.string().required(),            // Question key (correct answer)
      Notes: a.string(),                     // Optional notes
      Rationale: a.string().required(),      // Main rationale
      CreatedDate: a.string().required(),    // Sort key
      CreatedBy: a.string().required(),      // Creator identifier
      responseA: a.string().required(),      // Option A text
      responseB: a.string().required(),      // Option B text
      responseC: a.string().required(),      // Option C text
      responseD: a.string().required(),      // Option D text
      responseE: a.string(),                 // Optional Option E text
      responseF: a.string(),                 // Optional Option F text
      rationaleA: a.string().required(),     // Explanation for option A
      rationaleB: a.string().required(),     // Explanation for option B
      rationaleC: a.string().required(),     // Explanation for option C
      rationaleD: a.string().required(),     // Explanation for option D
      rationaleE: a.string(),                // Optional explanation for option E
      rationaleF: a.string(),                // Optional explanation for option F
      Topic: a.string().required(),          // Question topic
      KnowledgeSkills: a.string().required(), // Knowledge and skills
      Tags: a.string(),                      // Optional tags (comma-separated)
      responsesJson: a.string().required(),   // Additional response data in JSON format
    })
    .authorization((allow) => [allow.publicApiKey()])
    .identifier(['QuestionId', 'CreatedDate']),
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
To interact with the Item table from your frontend code, generate a Data 
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
  QuestionId: "123",
  CreatedDate: "2024-03-14"
})

// Create a new item
const newItem = await client.models.Item.create({
  QuestionId: "123",
  CreatedDate: new Date().toISOString(),
  stem: "What is...",
  responseA: "Option A",
  rationaleA: "Because...",
  // ... other required fields
})

// Delete an item
await client.models.Item.delete({
  QuestionId: "123",
  CreatedDate: "2024-03-14"
})
=========================================================================*/
