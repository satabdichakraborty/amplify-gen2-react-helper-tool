import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import generateRationaleModule from './functions/generateRationale/resource';
import * as iam from 'aws-cdk-lib/aws-iam';

// Get the generate rationale function
const { generateRationale } = generateRationaleModule;

// Define the backend with resources
const backend = defineBackend({
  auth,
  data,
  generateRationale
});

// Add IAM permissions for Bedrock to the Lambda function
const generateRationaleLambda = backend.generateRationale.resources.lambda;

// Create a policy statement for Bedrock access
const bedrockStatement = new iam.PolicyStatement({
  effect: iam.Effect.ALLOW,
  actions: [
    'bedrock:InvokeModel',
    'bedrock:InvokeModelWithResponseStream'
  ],
  resources: [
    'arn:aws:bedrock:*:*:model/anthropic.claude-3-7-sonnet-20240620-v1:0',
  ]
});

// Add the policy to the Lambda role
generateRationaleLambda.addToRolePolicy(bedrockStatement);
