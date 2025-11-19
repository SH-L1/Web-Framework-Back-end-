import React, { useState, useEffect } from 'react';
import { useUserConfig } from '../../context/UserConfigContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 대한민국 주요 행정구역 전체 리스트
const ALL_REGIONS = [
  { value: '전체', label: '전국' },
  { value: '서울', label: '서울' },
  { value: '부산', label: '부산' },
  { value: '인천', label: '인천' },
  { value: '대구', label: '대구' },
  { value: '대전', label: '대전' },
  { value: '광주', label: '광주' },
  { value: '울산', label: '울산' },
  { value: '세종', label: '세종' },
  { value: '경기', label: '경기' },
  { value: '강원', label: '강원' },
  { value: '충북', label: '충북' },
  { value: '충남', label: '충남' },
  { value: '전북', label: '전북' },
  { value: '전남', label: '전남' },
  { value: '경북', label: '경북' },
  { value: '경남', label: '경남' },
  { value: '제주', label: '제주' }
];

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { config, updateConfig } = useUserConfig();
  const [region, setRegion] = useState(config.targetRegion);
  const [age, setAge] = useState(config.targetAge);

  useEffect(() => {
    if (isOpen) {
      setRegion(config.targetRegion);
      setAge(config.targetAge);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleSave = async () => {
    await updateConfig({ targetRegion: region, targetAge: age });
    onClose();
    // 페이지 새로고침을 제거하여 SPA 경험 유지 (Context가 상태를 전파함)
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-96 p-6 transform transition-all">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-xl font-bold text-gray-800">나의 타겟 설정</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
          주력으로 관리할 지역과 연령대를 설정하세요.<br/>
          <span className="text-blue-600 font-semibold">* 각 페이지 진입 시 이 설정이 '기본 선택'됩니다.</span>
        </p>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">주요 관리 지역</label>
            <div className="relative">
              <select 
                value={region} 
                onChange={(e) => setRegion(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 pr-10 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 shadow-sm cursor-pointer hover:border-blue-400 transition-colors"
                size={1} // 모바일/데스크탑 호환성
              >
                {ALL_REGIONS.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">주력 타겟 연령대</label>
            <div className="relative">
              <select 
                value={age} 
                onChange={(e) => setAge(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 pr-10 appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700 shadow-sm cursor-pointer hover:border-blue-400 transition-colors"
              >
                <option value="전체">전체 연령</option>
                <option value="10s">10대 (10s)</option>
                <option value="20s">20대 (20s)</option>
                <option value="30s">30대 (30s)</option>
                <option value="40s">40대 (40s)</option>
                <option value="50s">50대 이상 (50s+)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end space-x-3 border-t pt-4">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            취소
          </button>
          <button 
            onClick={handleSave}
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            설정 저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;