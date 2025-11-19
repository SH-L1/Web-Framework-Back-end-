import React, { createContext, useState, useContext, useEffect } from 'react';

interface UserConfig {
  targetRegion: string;
  targetAge: string;
}

interface UserConfigContextType {
  config: UserConfig;
  updateConfig: (newConfig: UserConfig) => Promise<void>;
  isLoading: boolean;
}

const UserConfigContext = createContext<UserConfigContextType | undefined>(undefined);

export const UserConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<UserConfig>({ targetRegion: '전체', targetAge: '전체' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 초기 로드 시 백엔드에서 설정 가져오기 (실패 시 기본값 유지)
    fetch('http://localhost:5000/api/config')
      .then((res) => {
        if (!res.ok) throw new Error('Config fetch failed');
        return res.json();
      })
      .then((data) => {
        if (data) {
          setConfig({
            targetRegion: data.targetRegion || '전체',
            targetAge: data.targetAge || '전체',
          });
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('설정 로드 실패 (백엔드 연결 확인 필요):', err);
        setIsLoading(false);
      });
  }, []);

  const updateConfig = async (newConfig: UserConfig) => {
    // UI 즉시 업데이트 (낙관적 업데이트)
    setConfig(newConfig);
    
    try {
      const res = await fetch('http://localhost:5000/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      if (!res.ok) throw new Error('Config update failed');
    } catch (err) {
      console.error('설정 저장 실패:', err);
      // 에러 발생 시 사용자에게 알리거나 롤백하는 로직 추가 가능
    }
  };

  return (
    <UserConfigContext.Provider value={{ config, updateConfig, isLoading }}>
      {children}
    </UserConfigContext.Provider>
  );
};

export const useUserConfig = () => {
  const context = useContext(UserConfigContext);
  if (context === undefined) {
    throw new Error('useUserConfig must be used within a UserConfigProvider');
  }
  return context;
};