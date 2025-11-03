import React from 'react';
import TabNavigation from '../dashboard/TabNavigation';
import { PageKey } from '../../config/navigation';

interface HeaderProps {
  currentPage: PageKey;
  onNavigate: (key: PageKey) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const goToHome = () => onNavigate('Home');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <div 
          onClick={goToHome}
          className="flex items-center space-x-2 cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
        >
          <svg className="w-7 h-7 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18"/><path d="M12 3v18"/><circle cx="12" cy="12" r="9"/></svg>
          <span className="text-xl font-extrabold text-gray-800 tracking-tight">
            PC방 Insights
          </span>
        </div>
        
        <TabNavigation currentPage={currentPage} onNavigate={onNavigate} />

        <div className="rounded-full bg-gray-200 w-10 h-10 flex items-center justify-center text-gray-600">
          <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
      </div>
    </header>
  );
};

export default Header;

