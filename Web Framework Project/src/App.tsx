import React, { useState, useMemo } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import RetentionPage from './pages/RetentionPage';
import CustomerInsightPage from './pages/CustomerInsightPage';
import ChurnPredictionPage from './pages/ChurnPredictionPage';
import { PageKey } from './config/navigation';
import { UserConfigProvider } from './context/UserConfigContext';
import './App.css'; 

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageKey>('Home');

  const renderPage = useMemo(() => {
    switch (currentPage) {
      case 'Retention':
        return <RetentionPage />;
      case 'Customer':
        return <CustomerInsightPage />;
      case 'Churn':
        return <ChurnPredictionPage />;
      case 'Home':
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  }, [currentPage]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-800">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />
      
      <main className="flex-grow w-full">
        {renderPage}
      </main>
      
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <UserConfigProvider>
      <AppContent />
    </UserConfigProvider>
  );
};

export default App;