// src/App.tsx
import React, { useState, useEffect } from 'react';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';
import Header from './components/Header';
import Login from './components/Login';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(
    localStorage.getItem('authToken')
  );
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    // ページ読み込み時にローカルストレージからトークンを読み込む
    const storedToken = localStorage.getItem('authToken');
    const storedUsername = localStorage.getItem('username');
    if (storedToken && storedUsername) {
      setAuthToken(storedToken);
      setIsLoggedIn(true);
      setUsername(storedUsername);
    }
  }, []);

  const handleLogin = (username: string, token: string) => {
    setAuthToken(token);
    setIsLoggedIn(true);
    setUsername(username);
    setShowLoginModal(false);
    setLoginError(null);
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('username', username);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername(null);
    setAuthToken(null);
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
  };

  const handleLoginError = (message: string) => {
    setLoginError(message);
  };

  return (
    <div className="min-h-screen bg-blue-900">
      <Header
        isLoggedIn={isLoggedIn}
        username={username}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={handleLogout}
      />
      
      <div className="px-3 py-3 flex flex-col items-center justify-start">
        {loginError && (
          <div className="bg-red-100 text-red-800 p-3 rounded mb-4 w-full max-w-lg">
            {loginError}
          </div>
        )}

        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="relative">
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginError(null);
                }}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
              <Login 
                onLogin={handleLogin}
                onError={handleLoginError}
              />
            </div>
          </div>
        )}

        {isLoggedIn ? (
          <>
            <TodoInput />
            <div className='px-5 py-10 w-full max-w-4xl'>
              <TodoList />
            </div>
          </>
        ) : (
          <div className="text-white text-center mt-10">
            ログインしてTodoリストを管理しましょう
          </div>
        )}
      </div>
    </div>
  );
};

export default App;