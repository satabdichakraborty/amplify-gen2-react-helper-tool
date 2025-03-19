import { defineFunction } from '@aws-amplify/backend';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

// Define the Lambda function with configuration
export const generateRationale = defineFunction({
  name: 'generateRationale',
  entry: './handler.ts',
  environment: {
    REGION: 'us-east-1', // Adjust region as needed for Bedrock availability
  },
});

// Add IAM permissions separately using CDK after function definition
const lambdaFunction = generateRationale.node.defaultChild;
if (lambdaFunction) {
  lambdaFunction.addToRolePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream'
      ],
      resources: [
        'arn:aws:bedrock:*:*:model/anthropic.claude-3-7-sonnet-20240620-v1:0',
      ],
    })
  );
}

// Export for compatibility
export default { generateRationale }; 