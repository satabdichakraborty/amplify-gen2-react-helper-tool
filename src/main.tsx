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
  console.log('Configuring Amplify with outputs:', JSON.stringify({
    auth: outputs.auth ? { ...outputs.auth, user_pool_id: '***', user_pool_client_id: '***' } : undefined,
    data: outputs.data ? { ...outputs.data, api_key: '***' } : undefined,
  }, null, 2));
  
  // In production, use the direct URL from outputs
  // In development, use the proxy URL
  const isLocalDev = import.meta.env.DEV && window.location.hostname === 'localhost';
  
  // Verify the outputs have the required fields
  if (!outputs.data || !outputs.data.url || !outputs.data.api_key) {
    throw new Error('Invalid Amplify outputs: Missing data, URL, or API key');
  }
  
  const config = {
    ...outputs,
    data: {
      ...outputs.data,
      // Use the proxy URL only in local development
      url: isLocalDev ? '/graphql' : outputs.data.url
    }
  };
  
  console.log('Using API endpoint:', config.data.url);
  
  // Configure Amplify
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
