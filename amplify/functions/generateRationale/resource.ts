import { defineFunction } from '@aws-amplify/backend';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';

// Define the Lambda function with configuration
export const generateRationale = defineFunction({
  name: 'generateRationale',
  entry: './handler.ts',
  environment: {
    REGION: 'us-east-1', // Adjust region as needed for Bedrock availability
  },
  // Use inline policy directly in the function definition
  access: {
    auth: {
      actions: ['bedrock:InvokeModel', 'bedrock:InvokeModelWithResponseStream'],
      resources: ['arn:aws:bedrock:*:*:model/anthropic.claude-3-7-sonnet-20240620-v1:0']
    }
  }
});

// Export for compatibility
export default { generateRationale }; 