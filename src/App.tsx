// src/App.tsx
import React from 'react';
import TodoInput from './components/TodoInput';
import TodoList from './components/TodoList';

const App: React.FC = () => {
  return (
    <div className="px-3 py-3 flex flex-col items-center justify-start min-h-screen bg-gray-100">
      <h2 className="px-3 py-3 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 drop-shadow-lg">
        Todo App
      </h2>
      <TodoInput />
      <div className='px-5 py-10'>
      <TodoList />
      </div>
    </div>
  );
};

export default App;
