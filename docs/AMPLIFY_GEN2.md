# AWS Amplify Gen2 Documentation

## 1. Overview
This document details the AWS Amplify Gen2 configuration and implementation in the React Helper Tool. Amplify Gen2 provides a modern, type-safe way to build full-stack applications with AWS services.

## 2. Project Structure
```
amplify/
├── auth/           # Authentication configuration
├── data/           # Data model and API configuration
└── backend.ts      # Main backend configuration
```

## 3. Backend Configuration

### 3.1 amplify.yml
The `amplify.yml` file configures the build and deployment process:

```yaml
version: 1
backend:
  phases:
    preBuild:
      commands:
        - npm ci --cache .npm --prefer-offline
        - cd amplify/functions/generateRationale && chmod +x install-deps.sh && ./install-deps.sh && cd ../../..
    build:
      commands:
        - npx ampx pipeline-deploy --branch $AWS_BRANCH --app-id $AWS_APP_ID
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --cache .npm --prefer-offline
        - npm install @cloudscape-design/components @cloudscape-design/global-styles
        - npm install react-router-dom @types/react-router-dom
        - npm install aws-amplify
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - .npm/**/*
      - node_modules/**/*
  customHeaders:
    - pattern: '**/*'
      headers:
        - key: 'Cache-Control'
          value: 'no-store'
    - pattern: 'static/**/*'
      headers:
        - key: 'Cache-Control'
```

Key features:
- Separate build phases for backend and frontend
- Caching for npm dependencies
- Custom headers for cache control
- LLM function dependency installation

### 3.2 Authentication (Cognito)
Authentication is configured in `amplify/auth/resource.ts`:

```typescript
import { defineAuth } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
});
```

Features:
- Email-based authentication
- Secure user management
- Built-in authentication UI components

### 3.3 Data Model and API
The data model is defined in `amplify/data/resource.ts`:

```typescript
const schema = a.schema({
  Item: a
    .model({
      QuestionId: a.integer().required(),  // Partition key
      CreatedDate: a.string().required(), // Sort key
      Question: a.string().required(),
      // ... other fields
    })
    .authorization((allow) => [allow.publicApiKey()])
    .identifier(['QuestionId', 'CreatedDate'])
});
```

Key features:
- Type-safe schema definition
- Composite key (QuestionId + CreatedDate)
- Public API key authorization
- Automatic timestamp management
- Support for optional fields

## 4. Frontend Integration

### 4.1 Client Generation
```typescript
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();
```

### 4.2 Data Operations
```typescript
// List items
const { data: items } = await client.models.Item.list();

// Get specific item
const { data: item } = await client.models.Item.get({
  QuestionId: 123,
  CreatedDate: "2024-03-14"
});

// Create item
const newItem = await client.models.Item.create({
  QuestionId: 123,
  CreatedDate: new Date().toISOString(),
  Question: "What is...",
  responseA: "Option A",
  rationaleA: "Because...",
  // ... other required fields
});

// Delete item
await client.models.Item.delete({
  QuestionId: 123,
  CreatedDate: "2024-03-14"
});
```

## 5. Authorization Modes
```typescript
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
```

Features:
- API Key-based authorization
- 30-day key expiration
- Public access for read operations
- Secure write operations

## 6. Type Safety
The schema generates TypeScript types automatically:
```typescript
export type Schema = ClientSchema<typeof schema>;
```

Benefits:
- Compile-time type checking
- IDE autocompletion
- Runtime type validation
- Type-safe API operations

## 7. Best Practices

### 7.1 Error Handling
```typescript
try {
  const response = await client.models.Item.create(item);
  // Handle success
} catch (error) {
  console.error('Error in createItem:', error);
  // Handle error appropriately
}
```

### 7.2 Data Validation
- Required fields are enforced at the schema level
- Type validation for all fields
- Custom validation rules can be added

### 7.3 Performance
- Efficient caching with custom headers
- Optimized npm dependency installation
- Separate build phases for better performance

## 8. Deployment

### 8.1 Build Process
1. Install dependencies
2. Build backend resources
3. Build frontend application
4. Deploy to AWS

### 8.2 Environment Variables
- AWS_BRANCH
- AWS_APP_ID
- Other environment-specific configurations

## 9. Security Considerations

### 9.1 Authentication
- Secure email-based authentication
- Token-based session management
- Automatic token refresh

### 9.2 API Security
- API key rotation
- Public/private key management
- Rate limiting

### 9.3 Data Protection
- Type-safe operations
- Input validation
- Secure data transmission

## 10. Troubleshooting

### 10.1 Common Issues
- API key expiration
- Type mismatches
- Network connectivity
- Build failures

### 10.2 Debugging
- Enable logging
- Check network requests
- Verify environment variables
- Monitor AWS CloudWatch logs 