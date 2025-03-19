import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    includeSource: ['*.ts'],
    exclude: ['node_modules'],
  },
}); 