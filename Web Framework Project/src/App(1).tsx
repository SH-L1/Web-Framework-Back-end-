import React, { useState, useMemo } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import RetentionPage from './pages/RetentionPage';
import CustomerInsightPage from './pages/CustomerInsightPage';
import ChurnPredictionPage from './pages/ChurnPredictionPage';
import { PageKey } from './config/navigation';
import './App.css';
import DataFilter from './components/dashboard/DataFilter';

// 1. [수정] 필터 옵션 (한글)
// 50, 60대는 CSV에 항목이 없으므로 일단 제외
const ALL_AGE_GROUPS = ['10대', '20대', '30대', '40대', '기타'];
const ALL_REGIONS = [
  '서울', '경기', '인천', '강원', '충남',
  '충북', '대전', '세종', '경남',
  '경북', '부산', '울산', '대구', '전남',
  '전북', '광주', '제주', '기타'
];
// 2. [새로 추가] 가격 필터 옵션
const ALL_PRICE_RANGES = [
  '~ 10,000원',
  '10,001 ~ 50,000원',
  '50,001 ~ 100,000원',
  '100,001원 ~',
];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageKey>('Home');

  // 3. [수정] 필터 상태 (한글로 저장)
  const [selectedAgeGroups, setSelectedAgeGroups] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  // 4. [새로 추가] 가격 필터 상태
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);

  // 5. [수정] 필터 핸들러
  const handleAgeFilterChange = (ageGroup: string) => {
    setSelectedAgeGroups(prev =>
      prev.includes(ageGroup)
        ? prev.filter(a => a !== ageGroup)
        : prev.concat(ageGroup)
    );
  };
  const handleRegionFilterChange = (region: string) => {
    setSelectedRegions(prev =>
      prev.includes(region)
        ? prev.filter(r => r !== region)
        : prev.concat(region)
    );
  };
  // 6. [새로 추가] 가격 필터 핸들러
  const handlePriceFilterChange = (priceRange: string) => {
    setSelectedPriceRanges(prev =>
      prev.includes(priceRange)
        ? prev.filter(p => p !== priceRange)
        : prev.concat(priceRange)
    );
  };

  const renderPage = useMemo(() => {
    // 7. [수정] 페이지에 전달할 props에 가격 필터 추가
    const filterProps = { 
      selectedAgeGroups, 
      selectedRegions,
      selectedPriceRanges, // <--- 추가
    };

    switch (currentPage) {
      case 'Retention':
        return <RetentionPage {...filterProps} />;
      case 'Customer':
        return <CustomerInsightPage {...filterProps} />;
      case 'Churn':
        return <ChurnPredictionPage {...filterProps} />;
      case 'Home':
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  }, [currentPage, selectedAgeGroups, selectedRegions, selectedPriceRanges]); // 8. [수정] 의존성에 가격 필터 추가

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 text-gray-800">
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />

      <main className="flex-grow w-full flex">
        {currentPage !== 'Home' && (
          <aside className="w-64 p-4 bg-white shadow-lg shrink-0 border-r border-gray-200">
            {/* 9. [수정] DataFilter에 가격 필터 props 전달 */}
            <DataFilter
              allAgeGroups={ALL_AGE_GROUPS}
              selectedAgeGroups={selectedAgeGroups}
              onAgeChange={handleAgeFilterChange}
              allRegions={ALL_REGIONS}
              selectedRegions={selectedRegions}
              onRegionChange={handleRegionFilterChange}
              allPriceRanges={ALL_PRICE_RANGES}
              selectedPriceRanges={selectedPriceRanges}
              onPriceChange={handlePriceFilterChange}
            />
          </aside>
        )}

        <div className="flex-grow overflow-auto">
          {renderPage}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;