import React from 'react';

interface HeaderProps {
  isLoggedIn: boolean;
  username: string | null;
  onLoginClick: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isLoggedIn, username, onLoginClick, onLogout }) => {
  return (
    <header className="bg-blue-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Todo App</h1>
        <div>
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <span>ようこそ、{username}さん</span>
              <button
                onClick={onLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              >
                ログアウト
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              ログイン
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header; 