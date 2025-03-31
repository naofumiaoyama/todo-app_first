import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addTodo, updateTodo, removeTodo } from '../features/todos/todoSlice'; // Redux actions
import { API_BASE_URL } from '../config/api';  // API_BASE_URLをインポート
import { Todo } from '../features/todos/Todo';

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
  const [category, setCategory] = useState<Todo['category']>(todo?.category || 'daily');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (isOpen) {
      setTitle(todo?.title || '');
      setDescription(todo?.description || '');
      setDueDate(todo?.dueDate || '');
      setPriority(todo?.priority || 'medium');
      setCategory(todo?.category || 'daily');
    }
  }, [isOpen, todo]);

  if (!isOpen) return null;

  // フロントの優先度をバックエンドの優先度に変換
  const getPriorityValue = (priority: string): number => {
    switch (priority) {
      case 'low': return 1;
      case 'high': return 3;
      default: return 2; // medium
    }
  };

  const handleSave = async () => {
    if (!title.trim() || isSubmitting) return;
    
    try {
      setIsSubmitting(true);

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.error('認証トークンがありません');
        return;
      }

      // バックエンドに送信するデータ
      const todoData = {
        title,
        description,
        priority: getPriorityValue(priority),
        completed: todo?.completed || false,
        dueDate: dueDate || null
      };

      if (todo) {
        // 既存のタスクを更新
        // 即時UI更新
        const updatedTodo: Todo = {
          ...todo,
          title,
          description,
          priority,
          dueDate: dueDate || null,
          category
        };
        dispatch(updateTodo(updatedTodo));
        onClose();

        // バックエンド更新
        const response = await fetch(`${API_BASE_URL}/todos/${todo.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(todoData)
        });

        if (!response.ok) {
          if (response.status === 401) {
            // 認証エラー時の処理
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            window.location.reload();
          } else {
            console.error('Update todo failed:', await response.text());
            // エラー時は元の状態に戻す
            dispatch(updateTodo(todo));
          }
        }
      } else {
        // 新規タスクを追加
        // 即時UI更新用の一時ID
        const tempId = Date.now().toString();
        const newTodo: Todo = {
          id: tempId,
          title,
          description,
          completed: false,
          dueDate: dueDate || null,
          priority,
          status: 'pending',
          creationDate: new Date().toISOString(),
          completionDate: null,
          category
        };
        dispatch(addTodo(newTodo));
        onClose();

        // バックエンド更新
        const response = await fetch(`${API_BASE_URL}/todos`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
          },
          body: JSON.stringify(todoData)
        });

        if (!response.ok) {
          console.error('Add todo failed:', await response.text());
          // エラー時は元の状態に戻す
          dispatch(removeTodo(tempId));
        } else {
          const newTodoData = await response.json();
          // バックエンドから返されたIDで更新
          dispatch(removeTodo(tempId));
          const finalTodo: Todo = {
            id: newTodoData.id,
            title: newTodoData.title,
            description: newTodoData.description || '',
            completed: newTodoData.completed,
            dueDate: dueDate || null,
            priority: newTodoData.priority === 1 ? 'low' : newTodoData.priority === 3 ? 'high' : 'medium',
            status: 'pending',
            creationDate: newTodoData.created_at,
            completionDate: null,
            category
          };
          dispatch(addTodo(finalTodo));
        }
      }
    } catch (error) {
      console.error('Error saving todo:', error);
      // エラー時は元の状態に戻す
      if (todo) {
        dispatch(updateTodo(todo));
      }
    } finally {
      setIsSubmitting(false);
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
          onChange={(e) => setCategory(e.target.value as 'work' | 'daily' | 'special')}
          className="w-full mb-4 px-2 py-1 border"
        >
          <option value="work">仕事</option>
          <option value="daily">日常</option>
          <option value="special">特別</option>
        </select>
        <button 
          onClick={handleSave} 
          className={`bg-blue-600 text-white py-2 px-4 rounded ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? '処理中...' : addMode ? '追加' : '保存'}
        </button>
        <button onClick={onClose} className="ml-2 py-2 px-4 rounded">Cancel</button>
      </div>
    </div>
  );
};

export default TodoEdit;