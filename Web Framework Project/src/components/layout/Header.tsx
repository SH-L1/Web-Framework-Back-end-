import React, { useState, useRef, useEffect } from 'react';
import { PageKey, PAGES } from '../../config/navigation';
import SettingsModal from './SettingsModal';
import { useUserConfig } from '../../context/UserConfigContext';
import { REGION_MAP } from '../dashboard/DataFilter';

interface HeaderProps {
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // 프로필 팝업 상태
  const { config } = useUserConfig();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 팝업 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 설정값 한글 변환
  const displayRegion = config.targetRegion === '전체' ? '전국' : (REGION_MAP[config.targetRegion] || config.targetRegion);
  const displayAge = config.targetAge === '전체' ? '전연령' : config.targetAge.replace('s', '대');

  return (
    <header className="bg-white shadow-md z-20 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer group" 
              onClick={() => onNavigate('Home')}
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg mr-2 flex items-center justify-center text-white font-bold text-lg group-hover:bg-blue-700 transition-colors">P</div>
              <span className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">PC방 Insight</span>
            </div>
            
            <nav className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {PAGES.map((page) => (
                <button
                  key={page.key}
                  onClick={() => onNavigate(page.key)}
                  className={`${
                    currentPage === page.key
                      ? 'border-blue-500 text-blue-600 font-bold'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm transition-all duration-200`}
                >
                  {page.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex flex-col items-end">
               <span className="text-[10px] text-gray-400 uppercase tracking-wider">Targeting</span>
               <span className="text-sm font-bold text-gray-700">
                 {displayRegion} · {displayAge}
               </span>
            </div>

            {/* 프로필 드롭다운 */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2 focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm border-2 border-white ring-2 ring-gray-100 cursor-pointer">
                  A
                </div>
              </button>

              {/* 팝업 메뉴 */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 transform transition-all origin-top-right z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-500">환영합니다!</p>
                    <p className="text-sm font-bold text-gray-900 truncate">Admin 님</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsSettingsOpen(true);
                      setIsProfileOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    타겟 설정 변경
                  </button>
                  <button
                    onClick={() => alert('로그아웃 기능은 준비 중입니다.')}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </header>
  );
};

export default Header;