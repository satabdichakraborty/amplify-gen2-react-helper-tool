import { Amplify } from 'aws-amplify';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ItemsList } from './components/ItemsList';
import CreateEditItem from './components/CreateEditItem';
import './App.css';

// Configure Amplify based on environment
const configureAmplify = () => {
  // Use environment variables for both development and production
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: import.meta.env.VITE_AMPLIFY_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_AMPLIFY_IDENTITY_POOL_ID,
        identityPoolId: import.meta.env.VITE_AMPLIFY_IDENTITY_POOL_ID,
        signUpVerificationMethod: 'code',
      },
    },
    API: {
      GraphQL: {
        endpoint: import.meta.env.VITE_AMPLIFY_GRAPHQL_ENDPOINT,
        region: import.meta.env.VITE_AMPLIFY_REGION,
        apiKey: import.meta.env.VITE_AMPLIFY_GRAPHQL_API_KEY,
        defaultAuthMode: 'apiKey',
      },
    },
  });
};

// Initialize Amplify configuration
configureAmplify();

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/items" replace />} />
        <Route path="/items" element={<ItemsList />} />
        <Route path="/items/new" element={<CreateEditItem />} />
        <Route path="/items/:id/edit" element={<CreateEditItem />} />
      </Routes>
    </Router>
  );
}

export default App; 