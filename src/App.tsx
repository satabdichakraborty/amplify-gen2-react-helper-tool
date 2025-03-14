import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import CreateEditItem from './components/CreateEditItem';
import { ItemsList } from './components/ItemsList';

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