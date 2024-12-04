// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage';
import DetectedObjectsPage from './pages/DetectedObjectsPage';
import FindObjectPage from './pages/FindObjectPage';
import NavBar from './components/NavBar';

function App() {
  return (
    <Router>
      <div className="App">
        {/* NavBar is placed outside Routes to appear on all pages */}
        <NavBar />
        <div className="App-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/detected-objects" element={<DetectedObjectsPage />} />
            <Route path="/find-object" element={<FindObjectPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
