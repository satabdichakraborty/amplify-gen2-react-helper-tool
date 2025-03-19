import { defineBackend } from '@aws-amplify/backend';
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam';
import { auth } from './auth/resource';
import { data } from './data/resource';
import generateRationaleModule from './functions/generateRationale/resource';

// Get the generate rationale function
const { generateRationale } = generateRationaleModule;

// Add permissions to the function
generateRationale.addPermissions([
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
]);

// Define the backend
defineBackend({
  auth,
  data,
  generateRationale,
});
