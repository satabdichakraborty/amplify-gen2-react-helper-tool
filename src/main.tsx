import React from "react";
import ReactDOM from "react-dom/client";
import { Amplify } from "aws-amplify";
import { generateClient } from "@aws-amplify/api";
import { type Schema } from '../amplify/data/resource';
import outputs from "../amplify_outputs.json";
import App from "./App";
import "./index.css";

// Configure Amplify using the outputs directly
try {
  console.log('Configuring Amplify with outputs:', outputs);
  Amplify.configure(outputs);
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
