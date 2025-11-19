import React, { useState } from 'react'; // 1. useState를 import 합니다.

// DataFilterProps 인터페이스는 수정할 필요 없습니다. (props는 그대로 받음)
interface DataFilterProps {
  allAgeGroups: string[];
  selectedAgeGroups: string[];
  onAgeChange: (ageGroup: string) => void;
  allRegions: string[];
  selectedRegions: string[];
  onRegionChange: (region: string) => void;
  allPriceRanges: string[];
  selectedPriceRanges: string[];
  onPriceChange: (priceRange: string) => void;
}

const DataFilter: React.FC<DataFilterProps> = ({
  allAgeGroups,
  selectedAgeGroups,
  onAgeChange,
  allRegions,
  selectedRegions,
  onRegionChange,
  allPriceRanges,
  selectedPriceRanges,
  onPriceChange,
}) => {
  // 2. 각 카테고리의 열림/닫힘 상태를 관리하는 local state를 추가합니다.
  //    (처음에는 닫혀있도록 false로 설정)
  const [isAgeOpen, setIsAgeOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);

  return (
    // 3. UI가 딱 붙어 보이지 않게 space-y-2 정도로 조정합니다.
    <div className="space-y-2 sticky top-24">
      {/* 4. 연령대 필터 (수정) */}
      <div className="border-b">
        {/* 5. <h3>를 <button>으로 변경하여 클릭 이벤트를 추가합니다. */}
        <button
          onClick={() => setIsAgeOpen(!isAgeOpen)} // 클릭하면 상태를 반전 (true <-> false)
          className="w-full flex justify-between items-center text-lg font-semibold text-gray-800 p-2 hover:bg-gray-100 rounded"
        >
          <span>연령대</span>
          {/* 6. 열림/닫힘 상태에 따라 아이콘을 표시합니다. */}
          <span className="text-sm">{isAgeOpen ? '▲' : '▼'}</span>
        </button>
        
        {/* 7. isAgeOpen이 true일 때만 체크박스 목록을 보여줍니다. */}
        {isAgeOpen && (
          <div className="space-y-1 max-h-48 overflow-y-auto p-2">
            {allAgeGroups.map((age) => (
              <label key={age} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  className="rounded text-blue-600 focus:ring-blue-500"
                  checked={selectedAgeGroups.includes(age)}
                  onChange={() => onAgeChange(age)}
                />
                <span className="text-sm text-gray-700">{age}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 8. 가격 필터 (동일하게 수정) */}
      <div className="border-b">
        <button
          onClick={() => setIsPriceOpen(!isPriceOpen)}
          className="w-full flex justify-between items-center text-lg font-semibold text-gray-800 p-2 hover:bg-gray-100 rounded"
        >
          <span>결제 금액 </span>
          <span className="text-sm">{isPriceOpen ? '▲' : '▼'}</span>
        </button>
        {isPriceOpen && (
          <div className="space-y-1 max-h-48 overflow-y-auto p-2">
            {allPriceRanges.map((range) => (
              <label key={range} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  className="rounded text-blue-600 focus:ring-blue-500"
                  checked={selectedPriceRanges.includes(range)}
                  onChange={() => onPriceChange(range)}
                />
                <span className="text-sm text-gray-700">{range}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* 9. 지역 필터 (동일하게 수정) */}
      <div className="border-b">
        <button
          onClick={() => setIsRegionOpen(!isRegionOpen)}
          className="w-full flex justify-between items-center text-lg font-semibold text-gray-800 p-2 hover:bg-gray-100 rounded"
        >
          <span>지역</span>
          <span className="text-sm">{isRegionOpen ? '▲' : '▼'}</span>
        </button>
        {isRegionOpen && (
          <div className="space-y-1 max-h-96 overflow-y-auto p-2">
            {allRegions.map((region) => (
              <label key={region} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  className="rounded text-blue-600 focus:ring-blue-500"
                  checked={selectedRegions.includes(region)}
                  onChange={() => onRegionChange(region)}
                />
                <span className="text-sm text-gray-700">{region}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataFilter;