import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Todo } from '../features/todos/Todo';
import { toggleTodo, removeTodo } from '../features/todos/todoSlice';
import { API_BASE_URL } from '../config/api';  // API_BASE_URLをインポート
import TodoEdit from './TodoEdit'; 
import { useDrag, useDrop } from 'react-dnd';

interface TodoItemProps {
  todo: Todo;
  index: number;
  moveTodo: (dragIndex: number, hoverIndex: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, index, moveTodo }) => {
  const dispatch = useDispatch();
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

  // チェックボックスの変更処理
  const handleToggle = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('認証トークンがありません');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/todos/${todo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ completed: !todo.completed })
      });
      
      if (response.ok) {
        dispatch(toggleTodo(todo.id));
      } else {
        console.error('Toggle todo failed:', await response.text());
      }
    } catch (error) {
      console.error('Error updating todo:', error);
    }
  };

  // 削除処理
  const handleDelete = async () => {
    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      console.error('認証トークンがありません');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/todos/${todo.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        dispatch(removeTodo(todo.id));
      } else {
        console.error('Delete todo failed:', await response.text());
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  return (
    <div
      ref={ref}
      className="bg-white shadow-md rounded-lg p-4 mb-4 w-96"  // w-96 で横幅を固定
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="flex items-center justify-between">
        {/* チェックボックスとタイトル・説明 */}
        <div className="flex items-start">
          {/* チェックボックス */}
          <input
            className="w-8 h-8 mr-4"
            type="checkbox"
            checked={todo.completed}
            onChange={handleToggle}  // インラインの関数をhandleToggleに変更
          />
        
          {/* タイトルと説明を縦に並べる */}
          <div className="flex flex-col">
            <label
              className="text-2xl truncate cursor-pointer"
              style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
              onClick={openEditModal}
            >
              {todo.title}
            </label>
            <label className="text-gray-600">
              {todo.description || '説明なし'}
            </label>
          </div>
        </div>

        {/* 削除ボタン */}
        <button
          className="bg-blue-800 text-white px-3 py-1 rounded"
          onClick={handleDelete}  // インラインの関数をhandleDeleteに変更
        >
          削除
        </button>
      </div>

      {/* 追加項目の表示 */}
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        <p><strong>期限:</strong> {todo.dueDate || '未設定'}</p>
        <p><strong>優先度:</strong> {todo.priority}</p>
        <p><strong>ステータス:</strong> {todo.status}</p>
        <p><strong>作成日:</strong> {todo.creationDate.toLocaleDateString()}</p>
        <p><strong>カテゴリ:</strong> {todo.category}</p>
      </div>

      {/* 編集モーダル */}
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
