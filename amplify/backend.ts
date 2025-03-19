import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import generateRationaleModule, { generateRationaleResources } from './functions/generateRationale/resource';

// Get the generate rationale function
const { generateRationale } = generateRationaleModule;

// Define the backend
const backend = defineBackend({
  auth,
  data,
  generateRationale
});

// Apply IAM permissions via stack mapping
backend.resources(generateRationaleResources);
