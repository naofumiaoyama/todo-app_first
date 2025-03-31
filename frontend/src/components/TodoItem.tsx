import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Todo } from '../features/todos/Todo';
import { toggleTodo, removeTodo, addTodo } from '../features/todos/todoSlice';
import { API_BASE_URL } from '../config/api';  // API_BASE_URLをインポート
import TodoEdit from './TodoEdit';
import { useDrag, useDrop } from 'react-dnd';
import { useNavigate } from 'react-router-dom';

// カスタムツールチップコンポーネント
const Tooltip: React.FC<{ text: string; children: React.ReactNode }> = ({ text, children }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      {showTooltip && (
        <div className="absolute z-10 px-2 py-1 text-sm text-white bg-gray-800 rounded -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {text}
          <div className="absolute w-2 h-2 bg-gray-800 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
};

interface TodoItemProps {
  todo: Todo;
  index: number;
  moveTodo: (dragIndex: number, hoverIndex: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, index, moveTodo }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();  // 追加
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const openEditModal = () => {
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
  };

  const [{ isDragging }, drag] = useDrag({
    type: 'TODO',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'TODO',
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveTodo(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  drag(drop(ref));

  // 認証エラー時の処理を追加
  const handleAuthError = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    navigate('/');  // ログイン画面にリダイレクト
  };

  // チェックボックスの変更処理
  const handleToggle = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      handleAuthError();
      return;
    }

    try {
      const todoId = typeof todo.id === 'string' ? parseInt(todo.id, 10) : todo.id;
      // 現在の状態を反転
      const newCompleted = !todo.completed;
      
      // 即時UI更新
      const newTodo: Todo = {
        ...todo,
        completed: newCompleted,
        status: newCompleted ? 'completed' : 'pending'
      };
      dispatch(toggleTodo(newTodo));

      // バックエンド更新
      const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          completed: newCompleted
        })
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError();
        } else if (response.status === 404) {
          console.error('Todo not found:', todoId);
          // エラー時は元の状態に戻す
          dispatch(toggleTodo(todo));
        } else {
          const errorText = await response.text();
          console.error('Toggle todo failed:', errorText);
          // エラー時は元の状態に戻す
          dispatch(toggleTodo(todo));
        }
      }
    } catch (error) {
      console.error('Error updating todo:', error);
      // エラー時は元の状態に戻す
      dispatch(toggleTodo(todo));
    }
  };

  // 削除処理
  const handleDelete = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      handleAuthError();
      return;
    }

    try {
      // IDが数値であることを確認
      const todoId = typeof todo.id === 'string' ? parseInt(todo.id, 10) : todo.id;

      // 即時UI更新
      dispatch(removeTodo(todo.id));

      // バックエンド更新
      const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          handleAuthError();
        } else if (response.status === 404) {
          console.error('Todo not found:', todoId);
          // エラー時は元の状態に戻す
          dispatch(addTodo(todo));
        } else {
          console.error('Delete todo failed:', await response.text());
          // エラー時は元の状態に戻す
          dispatch(addTodo(todo));
        }
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
      // エラー時は元の状態に戻す
      dispatch(addTodo(todo));
    }
  };

  // 日付フォーマット関数を日本語に
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未設定';
    try {
      return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return '無効な日付';
    }
  };

  return (
    <div
      ref={ref}
      className="bg-white shadow-md rounded-lg p-4 mb-4 w-[576px] mx-auto"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-start">
          <input
            className="w-8 h-8 mr-4"
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggle}
          />
        
          <div className="flex flex-col">
            <Tooltip text="データを変更">
              <label
                className="text-2xl truncate cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-200"
                style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
                onClick={openEditModal}
              >
                {todo.title}
              </label>
            </Tooltip>
            <label className="text-gray-600">
              {todo.description || '説明なし'}
            </label>
          </div>
        </div>

        <button
          className="bg-blue-800 text-white px-3 py-1 rounded"
          onClick={handleDelete}
        >
          削除
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        <p><strong>期限:</strong> {formatDate(todo.dueDate)}</p>
        <p><strong>優先度:</strong> {todo.priority === 'low' ? '低' : todo.priority === 'high' ? '高' : '中'}</p>
        <p><strong>状態:</strong> {todo.status === 'completed' ? '完了' : '未完了'}</p>
        <p><strong>作成日:</strong> {formatDate(todo.creationDate)}</p>
        <p><strong>カテゴリ:</strong> {todo.category === 'work' ? '仕事' : todo.category === 'daily' ? '日常' : '特別'}</p>
      </div>

      {isEditModalOpen && (
        <TodoEdit
          addMode={false}
          todo={todo}
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
        />
      )}
    </div>
  );
};

export default TodoItem;
