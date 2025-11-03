import React from 'react';
import { PAGES, PageKey } from '../../config/navigation';

interface TabNavigationProps {
  currentPage: PageKey;
  onNavigate: (key: PageKey) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ currentPage, onNavigate }) => {
  return (
    <div className="flex space-x-2 p-2 bg-white/50 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100">
      {PAGES.map((page) => (
        <button
          key={page.key}
          onClick={() => onNavigate(page.key)}
          className={`
            flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
            ${currentPage === page.key
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          <page.icon className="w-5 h-5" />
          <span>{page.name}</span>
        </button>
      ))}
    </div>
  );
};

export default TabNavigation;

