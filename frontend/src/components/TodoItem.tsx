import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Todo } from '../features/todos/Todo';
import { toggleTodo, removeTodo } from '../features/todos/todoSlice';
import { API_BASE_URL } from '../config/api';  // API_BASE_URLをインポート
import TodoEdit from './TodoEdit';
import { useDrag, useDrop } from 'react-dnd';
import { useNavigate } from 'react-router-dom';


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
      console.log(todo.completed);
      // 現在の状態を反転
      const newCompleted = !todo.completed;
      console.log(newCompleted);
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
      
      if (response.ok) {
        const updatedTodo = await response.json();
        console.log('Updated todo:', updatedTodo);
        
        // Todoオブジェクトを更新
        const newTodo: Todo = {
          ...todo,
          completed: updatedTodo.completed,
          status: updatedTodo.completed ? 'completed' : 'pending'
        };
        
        // Reduxストアを更新
        dispatch(toggleTodo(newTodo));
      } else if (response.status === 401) {
        handleAuthError();
      } else if (response.status === 404) {
        console.error('Todo not found:', todoId);
      } else {
        const errorText = await response.text();
        console.error('Toggle todo failed:', errorText);
      }
    } catch (error) {
      console.error('Error updating todo:', error);
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

      const response = await fetch(`${API_BASE_URL}/todos/${todoId}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (response.ok) {
        dispatch(removeTodo(todo.id));
      } else if (response.status === 401) {
        handleAuthError();
      } else if (response.status === 404) {
        console.error('Todo not found:', todoId);
      } else {
        console.error('Delete todo failed:', await response.text());
      }
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  // 日付フォーマット関数を英語に
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div
      ref={ref}
      className="bg-white shadow-md rounded-lg p-4 mb-4 w-96"
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
            <label
              className="text-2xl truncate cursor-pointer"
              style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
              onClick={openEditModal}
            >
              {todo.title}
            </label>
            <label className="text-gray-600">
              {todo.description || 'No description'}
            </label>
          </div>
        </div>

        <button
          className="bg-blue-800 text-white px-3 py-1 rounded"
          onClick={handleDelete}
        >
          Delete
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        <p><strong>Due Date:</strong> {formatDate(todo.dueDate)}</p>
        <p><strong>Priority:</strong> {todo.priority}</p>
        <p><strong>Status:</strong> {todo.status}</p>
        <p><strong>Created:</strong> {formatDate(todo.creationDate)}</p>
        <p><strong>Category:</strong> {todo.category}</p>
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
