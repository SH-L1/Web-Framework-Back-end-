import React, { useState, useEffect } from 'react';
import { useUserConfig } from '../../context/UserConfigContext';
import { REGION_MAP } from '../dashboard/DataFilter';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

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
          <span className="text-blue-600 font-semibold">* 페이지 진입 시 해당 조건이 기본 선택됩니다.</span>
        </p>

        <div className="space-y-5">
          {/* 지역 선택 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">주요 관리 지역</label>
            <div className="relative">
              <select 
                value={region} 
                onChange={(e) => setRegion(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 pr-10 appearance-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 shadow-sm cursor-pointer"
              >
                <option value="전체">전국 (전체)</option>
                {/* 영어 코드(key)를 value로, 한글 이름(label)만 텍스트로 표시 */}
                {Object.entries(REGION_MAP).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* 연령 선택 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">주력 타겟 연령대</label>
            <div className="relative">
              <select 
                value={age} 
                onChange={(e) => setAge(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 pr-10 appearance-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 shadow-sm cursor-pointer"
              >
                <option value="전체">전체 연령</option>
                <option value="10s">10대</option>
                <option value="20s">20대</option>
                <option value="30s">30대</option>
                <option value="40s">40대</option>
                <option value="50s">50대 이상</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"></path></svg>
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
            className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all"
          >
            설정 저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;