import React, { useState } from 'react';
import { PageKey, PAGES } from '../../config/navigation';
import SettingsModal from './SettingsModal';
import { useUserConfig } from '../../context/UserConfigContext';

interface HeaderProps {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { config } = useUserConfig();

  return (
    <header className="bg-white shadow-md z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer !space-x-2"
              onClick={() => onNavigate('Home')}
            >
              <svg 
                className="w-7 h-7 text-blue-600" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <polyline points="6 10 9 7 12 10 15 7 18 10" stroke="#a0aec0" strokeWidth="1.5" /> 
              </svg>
              <span className="text-2xl font-bold text-blue-600">PC방 Insight</span>
            </div>
            
            <nav className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {PAGES.map((page) => (
                <button
                  key={page.key}
                  onClick={() => onNavigate(page.key)}
                  className={`${
                    currentPage === page.key
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
                >
                  {page.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex flex-col items-end mr-2">
               <span className="text-xs text-gray-500">현재 타겟팅 설정</span>
               <span className="text-sm font-bold text-blue-700">
                 {config.targetRegion === '전체' ? '전국' : config.targetRegion} / {config.targetAge === '전체' ? '전연령' : config.targetAge}
               </span>
            </div>

            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none relative"
              title="타겟 설정"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                A
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">Admin</span>
            </div>
          </div>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
};

export default Header;