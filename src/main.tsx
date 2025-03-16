import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import { generateClient } from "@aws-amplify/api";
import { type Schema } from '../amplify/data/resource';
import outputs from "../amplify_outputs.json";
import App from "./App";
import "./index.css";

// Configure Amplify using the outputs with proxy for development
try {
  console.log('Configuring Amplify with outputs:', outputs);
  
  // Create a modified config that uses the proxy URL for development
  const config = {
    ...outputs,
    data: {
      ...outputs.data,
      // Use the proxy URL in development
      url: import.meta.env.DEV ? '/graphql' : outputs.data.url
    }
  };
  
  Amplify.configure(config);
  console.log('Amplify configured successfully');
} catch (error) {
  console.error('Error configuring Amplify:', error);
  throw error;
}

// Generate the client
console.log('Generating API client...');
export const client = generateClient<Schema>();
console.log('API client generated successfully');

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
