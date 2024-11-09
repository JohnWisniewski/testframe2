// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import DetectedObjectsPage from './pages/DetectedObjectsPage';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/detected-objects" element={<DetectedObjectsPage />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App;

