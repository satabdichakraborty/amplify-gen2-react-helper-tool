import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ItemsList } from './components/ItemsList';
import CreateEditItem from './components/CreateEditItem';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ItemsList />} />
        <Route path="/items" element={<ItemsList />} />
        <Route path="/items/new" element={<CreateEditItem />} />
        <Route path="/items/:id/edit" element={<CreateEditItem />} />
      </Routes>
    </Router>
  );
}

export default App; 