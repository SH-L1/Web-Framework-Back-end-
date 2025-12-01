import React, { createContext, useState, useContext, useEffect } from 'react';

interface UserConfig {
  targetRegion: string;
  targetAge: string;
}

interface User {
  userId: string;
  username: string;
}

interface UserConfigContextType {
  user: User | null;
  config: UserConfig;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateConfig: (newConfig: UserConfig) => Promise<void>;
}

const UserConfigContext = createContext<UserConfigContextType | undefined>(undefined);

export const UserConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [config, setConfig] = useState<UserConfig>({ targetRegion: '전체', targetAge: '전체' });
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로드 시 로컬 스토리지 및 설정 확인
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('pcbang_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        await fetchConfig(parsedUser.userId);
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const fetchConfig = async (userId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/config/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setConfig({
          targetRegion: data.targetRegion || '전체',
          targetAge: data.targetAge || '전체',
        });
      }
    } catch (err) {
      console.error('설정 로드 실패:', err);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      if (res.ok) {
        const data = await res.json();
        const userData = { userId: data.userId, username: data.username };
        setUser(userData);
        localStorage.setItem('pcbang_user', JSON.stringify(userData));
        await fetchConfig(data.userId);
        return true;
      }
      return false;
    } catch (err) {
      console.error('로그인 오류:', err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setConfig({ targetRegion: '전체', targetAge: '전체' });
    localStorage.removeItem('pcbang_user');
  };

  const updateConfig = async (newConfig: UserConfig) => {
    if (!user) return;
    setConfig(newConfig);
    try {
      await fetch('http://localhost:5000/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.userId, ...newConfig }),
      });
    } catch (err) {
      console.error('설정 저장 실패:', err);
    }
  };

  return (
    <UserConfigContext.Provider value={{ user, config, updateConfig, login, logout, isLoading }}>
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