import { defineFunction } from '@aws-amplify/backend';
import type { StackContext } from "@aws-amplify/backend";

// Define the Lambda function with configuration
export const generateRationale = defineFunction({
  name: 'generateRationale',
  entry: './handler.ts',
  environment: {
    REGION: 'us-east-1', // Adjust region as needed for Bedrock availability
  }
});

// Add AWS Bedrock permissions using the cdk context
export const generateRationaleResources = (context: StackContext) => {
  // Get the function role
  const role = generateRationale.getResources(context).role;
  
  // Add the Bedrock permissions to the role
  role.addToPolicy({
    effect: 'Allow',
    actions: [
      'bedrock:InvokeModel',
      'bedrock:InvokeModelWithResponseStream'
    ],
    resources: [
      'arn:aws:bedrock:*:*:model/anthropic.claude-3-7-sonnet-20240620-v1:0',
    ]
  });
};

// Export for compatibility
export default { generateRationale }; 