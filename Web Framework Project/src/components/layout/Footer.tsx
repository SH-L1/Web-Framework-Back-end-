import React from 'react';

const Footer: React.FC = () => (
  <footer className="w-full bg-gray-800 text-white p-4 text-center text-sm mt-12 shadow-inner">
    <div className="max-w-7xl mx-auto">
      &copy; {new Date().getFullYear()} PC방 데이터 인사이트 대시보드
    </div>
  </footer>
);

export default Footer;

