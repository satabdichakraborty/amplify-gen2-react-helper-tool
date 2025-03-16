import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/*== STEP 1 ===============================================================
The section below creates database tables for storing question data and related options.
=========================================================================*/
const schema = a.schema({
  Item: a
    .model({
      QuestionId: a.integer().required(),  // Partition key
      CreatedDate: a.string().required(), // Sort key
      Question: a.string().required(),    // The question text
      responseA: a.string().required(),   // Option A text
      rationaleA: a.string().required(),  // Explanation for option A
      responseB: a.string().required(),   // Option B text
      rationaleB: a.string().required(),  // Explanation for option B
      responseC: a.string().required(),   // Option C text
      rationaleC: a.string().required(),  // Explanation for option C
      responseD: a.string().required(),   // Option D text
      rationaleD: a.string().required(),  // Explanation for option D
      rationaleE: a.string(),
      rationaleF: a.string(),
      Rationale: a.string(),
      Topic: a.string(),
      KnowledgeSkills: a.string(),
      Tags: a.string(),
      Type: a.string(),
      Status: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime()
    })
    .authorization((allow) => [allow.publicApiKey()])
    .identifier(['QuestionId', 'CreatedDate']),

  // New models for options
  Topic: a
    .model({
      id: a.id(),
      name: a.string().required(),
      description: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime()
    })
    .authorization((allow) => [allow.publicApiKey()]),

  KnowledgeSkill: a
    .model({
      id: a.id(),
      name: a.string().required(),
      description: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime()
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Tag: a
    .model({
      id: a.id(),
      name: a.string().required(),
      description: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime()
    })
    .authorization((allow) => [allow.publicApiKey()]),

  ItemType: a
    .model({
      id: a.id(),
      name: a.string().required(),
      description: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime()
    })
    .authorization((allow) => [allow.publicApiKey()]),

  ItemStatus: a
    .model({
      id: a.id(),
      name: a.string().required(),
      description: a.string(),
      createdAt: a.datetime(),
      updatedAt: a.datetime()
    })
    .authorization((allow) => [allow.publicApiKey()]),
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
To interact with the tables from your frontend code, generate a Data 
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

// List all topics
const { data: topics } = await client.models.Topic.list()

// Create a new topic
const newTopic = await client.models.Topic.create({
  name: "Mathematics",
  description: "Math-related questions"
})
=========================================================================*/
