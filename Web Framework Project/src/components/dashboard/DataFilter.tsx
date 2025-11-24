import React from 'react';

interface DataFilterProps {
  selectedRegions: string[];
  onRegionChange: (region: string) => void;
  selectedAges: string[];
  onAgeChange: (age: string) => void;
}

// ★ [수정됨] CSV 데이터(region_city_group)와 정확히 일치하는 키값 사용
export const REGION_MAP: { [key: string]: string } = {
  'Seoul': '서울',
  'Gyeonggi-do': '경기',
  'Incheon': '인천',
  'Gangwon-do': '강원',
  'Chungcheongbuk-do': '충북',
  'Chungcheongnam-do': '충남',
  'Daejeon': '대전',
  'Gyeongsangbuk-do': '경북',
  'Gyeongsangnam-do': '경남',
  'Daegu': '대구',
  'Ulsan': '울산',
  'Busan': '부산',
  'Jeollabuk-do': '전북',
  'Jeollanam-do': '전남',
  'Gwangju': '광주',
  'Sejong': '세종',
  'Jeju': '제주' // CSV에 Jeju-do가 아니라 Jeju로 되어있을 수도 있으니 주의 (보통 Jeju-do)
};

const REGIONS = Object.keys(REGION_MAP);

const AGES = ['10s', '20s', '30s', '40s', '50s'];
const AGE_LABELS: { [key: string]: string } = {
  '10s': '10대', '20s': '20대', '30s': '30대', '40s': '40대', '50s': '50대 이상'
};

const DataFilter: React.FC<DataFilterProps> = ({
  selectedRegions,
  onRegionChange,
  selectedAges,
  onAgeChange,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-md w-full lg:w-64 flex-shrink-0 h-fit border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
        <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
        데이터 필터
      </h3>

      <div className="mb-6">
        <h4 className="text-sm font-bold text-gray-700 mb-2">지역 (Region)</h4>
        <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar pr-1">
          {REGIONS.map((regionKey) => (
            <label key={regionKey} className="flex items-center space-x-2 cursor-pointer hover:bg-blue-50 p-1.5 rounded transition-colors">
              <input
                type="checkbox"
                checked={selectedRegions.includes(regionKey)}
                onChange={() => onRegionChange(regionKey)}
                className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{REGION_MAP[regionKey]}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mb-2">
        <h4 className="text-sm font-bold text-gray-700 mb-2">연령 (Age)</h4>
        <div className="space-y-1">
          {AGES.map((ageKey) => (
            <label key={ageKey} className="flex items-center space-x-2 cursor-pointer hover:bg-blue-50 p-1.5 rounded transition-colors">
              <input
                type="checkbox"
                checked={selectedAges.includes(ageKey)}
                onChange={() => onAgeChange(ageKey)}
                className="form-checkbox h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{AGE_LABELS[ageKey]}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DataFilter;