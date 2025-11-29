/**
 * Пример интеграции auth-server с XOLO Browser (Electron)
 * 
 * Этот файл показывает, как интегрировать auth-server
 * с вашим Electron приложением
 */

// ============================================
// 1. В renderer процессе (React компонент)
// ============================================

import React, { useState, useEffect } from 'react';

const AUTH_SERVER_URL = 'http://localhost:3001';

interface User {
  id: string;
  provider: 'google' | 'github';
  name: string;
  email?: string;
  picture: string;
  username?: string;
}

export function AuthComponent() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);

  // Проверка авторизации при загрузке
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${AUTH_SERVER_URL}/api/auth/status`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.authenticated) {
        setIsAuthenticated(true);
        setUser(data.user);
        
        // Сохраняем в localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
    }
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    
    // Открываем окно авторизации
    const authWindow = window.open(
      `${AUTH_SERVER_URL}/auth/google`,
      'Google Auth',
      'width=500,height=700,left=100,top=100'
    );

    // Проверяем статус каждую секунду
    const checkInterval = setInterval(async () => {
      if (authWindow?.closed) {
        clearInterval(checkInterval);
        setLoading(false);
        await checkAuthStatus();
      }
    }, 1000);
  };

  const handleGitHubLogin = () => {
    setLoading(true);
    
    const authWindow = window.open(
      `${AUTH_SERVER_URL}/auth/github`,
      'GitHub Auth',
      'width=500,height=700,left=100,top=100'
    );

    const checkInterval = setInterval(async () => {
      if (authWindow?.closed) {
        clearInterval(checkInterval);
        setLoading(false);
        await checkAuthStatus();
      }
    }, 1000);
  };

  const handleLogout = async () => {
    try {
      await fetch(`${AUTH_SERVER_URL}/api/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  // Получение Gmail (только для Google)
  const getGmail = async () => {
    if (user?.provider !== 'google') {
      alert('Gmail доступен только для Google аккаунтов');
      return;
    }

    try {
      const response = await fetch(`${AUTH_SERVER_URL}/api/google/gmail`, {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('Gmail:', data);
      return data;
    } catch (error) {
      console.error('Ошибка получения Gmail:', error);
    }
  };

  // Получение Calendar (только для Google)
  const getCalendar = async () => {
    if (user?.provider !== 'google') {
      alert('Calendar доступен только для Google аккаунтов');
      return;
    }

    try {
      const response = await fetch(`${AUTH_SERVER_URL}/api/google/calendar`, {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('Calendar:', data);
      return data;
    } catch (error) {
      console.error('Ошибка получения Calendar:', error);
    }
  };

  // Получение Drive (только для Google)
  const getDrive = async () => {
    if (user?.provider !== 'google') {
      alert('Drive доступен только для Google аккаунтов');
      return;
    }

    try {
      const response = await fetch(`${AUTH_SERVER_URL}/api/google/drive`, {
        credentials: 'include'
      });
      const data = await response.json();
      console.log('Drive:', data);
      return data;
    } catch (error) {
      console.error('Ошибка получения Drive:', error);
    }
  };

  return (
    <div>
      {!isAuthenticated ? (
        <div>
          <h2>Войдите в систему</h2>
          <button onClick={handleGoogleLogin} disabled={loading}>
            {loading ? 'Загрузка...' : 'Войти через Google'}
          </button>
          <button onClick={handleGitHubLogin} disabled={loading}>
            {loading ? 'Загрузка...' : 'Войти через GitHub'}
          </button>
        </div>
      ) : (
        <div>
          <h2>Привет, {user?.name}!</h2>
          <img src={user?.picture} alt="Avatar" />
          <p>Провайдер: {user?.provider}</p>
          
          {user?.provider === 'google' && (
            <div>
              <h3>Google Сервисы</h3>
              <button onClick={getGmail}>Получить Gmail</button>
              <button onClick={getCalendar}>Получить Calendar</button>
              <button onClick={getDrive}>Получить Drive</button>
            </div>
          )}
          
          <button onClick={handleLogout}>Выйти</button>
        </div>
      )}
    </div>
  );
}

// ============================================
// 2. Создание React Hook для авторизации
// ============================================

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${AUTH_SERVER_URL}/api/auth/status`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      setIsAuthenticated(data.authenticated);
      setUser(data.user);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = (provider: 'google' | 'github') => {
    return new Promise<User>((resolve, reject) => {
      const authWindow = window.open(
        `${AUTH_SERVER_URL}/auth/${provider}`,
        `${provider} Auth`,
        'width=500,height=700'
      );

      const checkInterval = setInterval(async () => {
        if (authWindow?.closed) {
          clearInterval(checkInterval);
          
          const response = await fetch(`${AUTH_SERVER_URL}/api/auth/status`, {
            credentials: 'include'
          });
          const data = await response.json();
          
          if (data.authenticated) {
            setIsAuthenticated(true);
            setUser(data.user);
            resolve(data.user);
          } else {
            reject(new Error('Авторизация не удалась'));
          }
        }
      }, 1000);
    });
  };

  const logout = async () => {
    await fetch(`${AUTH_SERVER_URL}/api/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuthStatus
  };
}

// ============================================
// 3. Использование в WelcomePage
// ============================================

// В вашем WelcomePage.tsx добавьте:
/*
import { useAuth } from './useAuth';

const WelcomePage = ({ onComplete }) => {
  const { user, isAuthenticated, login, loading } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await login('google');
      // Пользователь авторизован, можно продолжить
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {!isAuthenticated ? (
        <button onClick={handleGoogleLogin}>
          Войти через Google
        </button>
      ) : (
        <div>
          <h2>Привет, {user?.name}!</h2>
          <button onClick={onComplete}>Продолжить</button>
        </div>
      )}
    </div>
  );
};
*/

// ============================================
// 4. API клиент для Google сервисов
// ============================================

export class GoogleServicesAPI {
  private baseUrl = AUTH_SERVER_URL;

  async getGmail() {
    const response = await fetch(`${this.baseUrl}/api/google/gmail`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch Gmail');
    }
    
    return response.json();
  }

  async getCalendar() {
    const response = await fetch(`${this.baseUrl}/api/google/calendar`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch Calendar');
    }
    
    return response.json();
  }

  async getDrive() {
    const response = await fetch(`${this.baseUrl}/api/google/drive`, {
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch Drive');
    }
    
    return response.json();
  }
}

// Использование:
// const googleAPI = new GoogleServicesAPI();
// const emails = await googleAPI.getGmail();

// ============================================
// 5. Сохранение токенов в electron-store
// ============================================

// В main процессе (main.ts):
/*
import Store from 'electron-store';

const store = new Store();

// Сохранение пользователя
ipcMain.handle('save-user', async (_, user) => {
  store.set('user', user);
  return true;
});

// Получение пользователя
ipcMain.handle('get-user', async () => {
  return store.get('user');
});

// Очистка пользователя
ipcMain.handle('clear-user', async () => {
  store.delete('user');
  return true;
});
*/

// В renderer процессе:
/*
// Сохранить пользователя
await window.electron.ipcRenderer.invoke('save-user', user);

// Получить пользователя
const user = await window.electron.ipcRenderer.invoke('get-user');

// Очистить пользователя
await window.electron.ipcRenderer.invoke('clear-user');
*/
