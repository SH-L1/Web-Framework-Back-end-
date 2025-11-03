import React from 'react';

export type PageKey = 'Home' | 'Retention' | 'Customer' | 'Churn';

export interface PageDefinition {
  key: PageKey;
  name: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => JSX.Element;
}

// 네비게이션 탭과 홈페이지에서 사용할 페이지 목록
export const PAGES: PageDefinition[] = [
  { key: 'Retention', name: '재구매율 분석', icon: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v3"/><path d="M18 17h3"/><path d="M13 17h5"/><path d="M8 17h5"/></svg>
  )},
  { key: 'Customer', name: '고객 특성 분석', icon: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  )},
  { key: 'Churn', name: '이탈 예측/관리', icon: (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="M16 2V7H22"/><path d="M19 19H5"/><path d="M16 13L12 17L8 13"/></svg>
  )},
];
