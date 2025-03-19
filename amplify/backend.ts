import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import generateRationaleModule from './functions/generateRationale/resource';

defineBackend({
  auth,
  data,
  generateRationale: generateRationaleModule.generateRationale,
});
