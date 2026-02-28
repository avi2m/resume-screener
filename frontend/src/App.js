import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import AnalysisPage from './pages/AnalysisPage';
import ResultsPage from './pages/ResultsPage';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [analysisData, setAnalysisData] = useState(null);

  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    if (data) setAnalysisData(data);
    window.scrollTo(0, 0);
  };

  return (
    <div className="App">
      {currentPage === 'home' && (
        <HomePage onGetStarted={() => navigateTo('analysis')} />
      )}
      {currentPage === 'analysis' && (
        <AnalysisPage
          onBack={() => navigateTo('home')}
          onResults={(data) => navigateTo('results', data)}
        />
      )}
      {currentPage === 'results' && analysisData && (
        <ResultsPage
          data={analysisData}
          onNewAnalysis={() => navigateTo('analysis')}
          onHome={() => navigateTo('home')}
        />
      )}
    </div>
  );
}

export default App;
