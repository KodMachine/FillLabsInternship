import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MasterView from './components/MasterView';
import DetailView from './components/DetailView';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<MasterView />} />
        <Route path="/detail/:operation/:id?" element={<DetailView />} />
      </Routes>
    </div>
  );
}

export default App;