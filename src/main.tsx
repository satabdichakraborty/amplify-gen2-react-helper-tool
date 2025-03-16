import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import { generateClient } from "@aws-amplify/api";
import { type Schema } from '../amplify/data/resource';
import App from "./App";
import "./index.css";

// Define the type for our outputs
interface AmplifyOutputs {
  graphqlEndpoint: string;
  region: string;
  authMode: string;
  apiKey: string;
}

// Create outputs object from environment variables
const outputs: AmplifyOutputs = {
  graphqlEndpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT || '',
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  authMode: 'apiKey',
  apiKey: import.meta.env.VITE_API_KEY || ''
};

// Configure Amplify using the outputs directly
try {
  console.log('Configuring Amplify with outputs:', outputs);
  Amplify.configure({
    API: {
      GraphQL: {
        endpoint: outputs.graphqlEndpoint,
        region: outputs.region,
        defaultAuthMode: "apiKey" as const,
        apiKey: outputs.apiKey
      }
    }
  });
  console.log('Amplify configured successfully');
} catch (error) {
  console.error('Error configuring Amplify:', error);
  throw error;
}

// Generate the client
console.log('Generating API client...');
const client = generateClient<Schema>();
console.log('API client generated successfully');

// Export the client for use in other files
export { client };

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
