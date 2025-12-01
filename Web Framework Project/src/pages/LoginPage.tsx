import React, { useState } from 'react';
import { useUserConfig } from '../context/UserConfigContext';

const LoginPage: React.FC = () => {
  const { login } = useUserConfig();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    const success = await login(username, password);
    if (!success) {
      setError('로그인에 실패했습니다. 아이디 또는 비밀번호를 확인하세요.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-2xl mb-4">P</div>
          <h2 className="text-2xl font-bold text-gray-800">PC방 Insight 로그인</h2>
          <p className="text-sm text-gray-500 mt-2">서비스 이용을 위해 로그인해주세요.<br/>(계정이 없으면 자동으로 생성됩니다)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="아이디 입력"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="비밀번호 입력"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-md"
          >
            로그인 / 시작하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;