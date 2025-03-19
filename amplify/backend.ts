import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import generateRationaleModule from './functions/generateRationale/resource';
import { aws_iam as iam } from 'aws-cdk-lib';

// Get the generate rationale function
const { generateRationale } = generateRationaleModule;

// Define the backend with IAM permissions via CDK
defineBackend({
  auth,
  data,
  generateRationale: generateRationale.addToRolePolicies([
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        'bedrock:InvokeModel',
        'bedrock:InvokeModelWithResponseStream'
      ],
      resources: [
        'arn:aws:bedrock:*:*:model/anthropic.claude-3-7-sonnet-20240620-v1:0',
      ],
    })
  ])
});
