import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ItemsList } from './components/ItemsList';
import { CreateEditItem } from './components/CreateEditItem';
import { Layout } from './components/Layout';
import { QuestionFormatter } from './components/QuestionFormatter';
import { PromptManagement } from './components/PromptManagement';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<ItemsList />} />
          <Route path="/items" element={<ItemsList />} />
          <Route path="/items/new" element={<CreateEditItem />} />
          <Route path="/items/:id/edit" element={<CreateEditItem />} />
          <Route path="/utilities/question-formatter" element={<QuestionFormatter />} />
          <Route path="/utilities/prompt-management" element={<PromptManagement />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App; 