import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import generateRationaleModule from './functions/generateRationale/resource';

// Get the generate rationale function
const { generateRationale } = generateRationaleModule;

// Define the backend
defineBackend({
  auth,
  data,
  generateRationale
});
