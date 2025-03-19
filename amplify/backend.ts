import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { generateRationale } from './functions/generateRationale/resource';

defineBackend({
  auth,
  data,
  generateRationale,
});
