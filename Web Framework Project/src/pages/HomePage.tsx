import React from 'react';
import { PAGES } from '../config/navigation';

const HomePage: React.FC = () => (
  <div className="p-8 max-w-4xl mx-auto bg-white rounded-xl shadow-lg mt-8">
    <h1 className="text-4xl font-bold text-blue-600 mb-4">PC방 고객 인사이트 대시보드</h1>
    <p className="text-lg text-gray-600 mb-6">
      데이터 기반의 효율적 고객 관리와 맞춤 마케팅 전략 수립을 위한 핵심 도구입니다.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {PAGES.map(page => (
        <div key={page.key} className="p-5 border border-gray-200 rounded-lg shadow-sm bg-gray-50">
          <page.icon className="w-8 h-8 text-blue-500 mb-3" />
          <h3 className="text-xl font-semibold text-gray-800">{page.name}</h3>
          <p className="text-sm text-gray-500 mt-2">
            {page.key === 'Retention' && "출석 빈도와 재구매율 간의 상관관계를 분석하고, 리텐션 개선 핵심 동인을 파악합니다."}
            {page.key === 'Customer' && "연령대, 지역 등 인구통계학적 특성을 분석하여 타겟 마케팅 기초 정보를 제공합니다."}
            {page.key === 'Churn' && "로지스틱 회귀 모델을 기반으로 이탈 위험 고객을 선별하고 선제적 관리를 돕습니다."}
          </p>
        </div>
      ))}
    </div>
  </div>
);

export default HomePage;
