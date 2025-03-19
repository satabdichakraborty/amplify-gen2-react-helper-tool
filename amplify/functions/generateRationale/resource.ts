import { defineFunction } from '@aws-amplify/backend';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export const generateRationale = defineFunction({
  name: 'generateRationale',
  entry: './handler.ts',
  environment: {
    REGION: 'us-east-1', // Adjust region as needed for Bedrock availability
  },
  permissions: [
    // Add permissions for Bedrock APIs
    new PolicyStatement({
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream'
      ],
      resources: [
        // Resource ARN pattern for Claude 3.7 Sonnet
        'arn:aws:bedrock:*:*:model/anthropic.claude-3-7-sonnet-20240620-v1:0',
      ],
    }),
  ]
});

// Add default export to ensure compatibility
export default { generateRationale }; 