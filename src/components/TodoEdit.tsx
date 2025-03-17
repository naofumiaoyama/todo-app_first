import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addTodo, updateTodo } from '../features/todos/todoSlice'; // Redux actions

interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string | null;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  creationDate: Date;
  completionDate: Date | null;
  category: '仕事' | '日常' | '特別';
}

interface TodoEditProps {
  addMode: boolean;
  todo: Todo | null;
  isOpen: boolean;
  onClose: () => void;
}

const TodoEdit: React.FC<TodoEditProps> = ({ addMode, todo, isOpen, onClose }) => {
  const [title, setTitle] = useState(todo?.title || '');
  const [description, setDescription] = useState(todo?.description || '');
  const [dueDate, setDueDate] = useState(todo?.dueDate || '');
  const [priority, setPriority] = useState(todo?.priority || 'medium');
  const [category, setCategory] = useState<Todo['category']>(todo?.category || '日常');
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      setTitle(todo?.title || '');
      setDescription(todo?.description || '');
      setDueDate(todo?.dueDate || '');
      setPriority(todo?.priority || 'medium');
      setCategory(todo?.category || '日常');
    }
  }, [isOpen, todo]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (title.trim()) {
      if (todo) {
        // 既存のタスクを更新
        const updatedTodo = {
          ...todo,
          title,
          description,
          dueDate,
          priority,
          category,
        };
        dispatch(updateTodo(updatedTodo));
      } else {
        // 新規タスクを追加
        const newTodo = {
          id: Date.now(),
          title,
          description,
          completed: false,
          dueDate,
          priority,
          status: 'pending',
          creationDate: new Date(),
          completionDate: null,
          category,
        };
        dispatch(addTodo(newTodo));
      }
      onClose(); // フォームを閉じる
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
        <h3 className="text-xl mb-4">{addMode ? '新規タスク' : 'タスク更新'}</h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full mb-4 px-2 py-1 border"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full mb-4 px-2 py-1 border"
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full mb-4 px-2 py-1 border"
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
          className="w-full mb-4 px-2 py-1 border"
        >
          <option value="low">低</option>
          <option value="medium">中</option>
          <option value="high">高</option>
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as '仕事' | '日常' | '特別')}
          className="w-full mb-4 px-2 py-1 border"
        >
          <option value="仕事">仕事</option>
          <option value="日常">日常</option>
          <option value="特別">特別</option>
        </select>
        <button onClick={handleSave} className="bg-blue-600 text-white py-2 px-4 rounded">
          {addMode ? '追加' : '保存'}
        </button>
        <button onClick={onClose} className="ml-2 py-2 px-4 rounded">Cancel</button>
      </div>
    </div>
  );
};

export default TodoEdit;
