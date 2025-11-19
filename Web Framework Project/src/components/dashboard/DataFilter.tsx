import React from 'react';

interface DataFilterProps {
  selectedRegions: string[];
  onRegionChange: (region: string) => void;
  selectedAges: string[];
  onAgeChange: (age: string) => void;
}

const REGIONS = [
  '서울', '부산', '인천', '대구', '대전', '광주',
  '울산', '세종', '경기', '강원', '충북', '충남',
  '전북', '전남', '경북', '경남', '제주'
];

const AGES = ['10s', '20s', '30s', '40s', '50s'];

const DataFilter: React.FC<DataFilterProps> = ({
  selectedRegions,
  onRegionChange,
  selectedAges,
  onAgeChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full lg:w-64 flex-shrink-0 h-fit">
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">데이터 필터</h3>

      {/* 지역 필터 */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-600 mb-2">지역 (Region)</h4>
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
          {REGIONS.map((region) => (
            <label key={region} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedRegions.includes(region)}
                onChange={() => onRegionChange(region)}
                className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{region}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 연령 필터 */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-600 mb-2">연령 (Age)</h4>
        <div className="space-y-2">
          {AGES.map((age) => (
            <label key={age} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedAges.includes(age)}
                onChange={() => onAgeChange(age)}
                className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{age}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataFilter;