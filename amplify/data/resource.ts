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
      QuestionId: a.string().required(),  // Partition key
      CreatedDate: a.string().required(), // Sort key
      stem: a.string().required(),        // The question text
      responseA: a.string().required(),   // Option A text
      rationaleA: a.string().required(),  // Explanation for option A
      responseB: a.string().required(),   // Option B text
      rationaleB: a.string().required(),  // Explanation for option B
      responseC: a.string().required(),   // Option C text
      rationaleC: a.string().required(),  // Explanation for option C
      responseD: a.string().required(),   // Option D text
      rationaleD: a.string().required(),  // Explanation for option D
      correctResponse: a.string().required(), // The correct answer (A, B, C, or D)
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
