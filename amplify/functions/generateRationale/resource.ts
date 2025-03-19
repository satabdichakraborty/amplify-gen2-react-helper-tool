import { defineFunction } from '@aws-amplify/backend';

export const generateRationale = defineFunction({
  name: 'generateRationale',
  entry: './handler.ts',
}); 