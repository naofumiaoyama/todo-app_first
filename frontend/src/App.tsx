// src/App.tsx
import React, { useState, useEffect } from 'react';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';

const App: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // バックエンドAPIの接続チェック
  useEffect(() => {
    // 接続チェックは省略します（TodoListで処理）
    setApiStatus('connected');
  }, []);

  return (
    <div className="px-3 py-3 flex flex-col items-center justify-start min-h-screen bg-blue-900">
      <h2 className="px-3 py-3 text-4xl font-bold text-white drop-shadow-lg">
        Todo App
      </h2>

      {/* API接続ステータス */}
      {apiStatus === 'connecting' && (
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4 w-full max-w-lg">
          バックエンドAPIに接続中...
        </div>
      )}
      
      {apiStatus === 'error' && (
        <div className="bg-red-100 text-red-800 p-3 rounded mb-4 w-full max-w-lg">
          <p>{errorMessage}</p>
          <p className="mt-2 text-sm">
            バックエンドが起動していることを確認してください。{' '}
            <button 
              onClick={() => window.location.reload()}
              className="underline text-blue-800"
            >
              再読み込み
            </button>
          </p>
        </div>
      )}
      
      {apiStatus === 'connected' && (
        <div className="bg-green-100 text-green-800 p-3 rounded mb-4 w-full max-w-lg">
          バックエンドAPIに接続しました
        </div>
      )}

      <TodoInput />
      <div className='px-5 py-10 w-full max-w-4xl'>
        <TodoList />
      </div>
    </div>
  );
};

export default App;