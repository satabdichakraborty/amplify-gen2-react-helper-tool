import { defineFunction } from '@aws-amplify/backend';

// Define the Lambda function with configuration
export const generateRationale = defineFunction({
  name: 'generateRationale',
  entry: './handler.ts',
  environment: {
    REGION: 'us-east-1', // Adjust region as needed for Bedrock availability
  },
  // IAM permissions are defined in the Amplify backend definition
  // They will be added at the project level instead of here
});

// Export for compatibility
export default { generateRationale }; 