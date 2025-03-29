import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RootState } from '../app/store';
import TodoItem from './TodoItem';
import { updateTodos } from '../features/todos/todoSlice';
import { Todo } from '../features/todos/Todo';
import { API_BASE_URL } from '../config/api';

const TodoList: React.FC = () => {
  const dispatch = useDispatch();
  const todos = useSelector((state: RootState) => state.todos.todos);
  const [sortedTodos, setSortedTodos] = useState(todos);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        
        if (!authToken) {
          setError('認証トークンがありません');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/todos`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`
          }
        });
        
        if (response.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('username');
          window.location.reload();
          return;
        }

        if (!response.ok) {
          throw new Error('タスクの取得に失敗しました');
        }

        const data = await response.json();
        
        if (!Array.isArray(data)) {
          throw new Error('サーバーから予期しないデータ形式を受信しました');
        }
        
        const formattedTodos: Todo[] = data.map((todo: any) => ({
          id: todo.id,
          title: todo.title,
          description: todo.description || '',
          completed: todo.completed,
          dueDate: todo.due_date,
          priority: todo.priority === 1 ? 'low' : todo.priority === 2 ? 'medium' : 'high',
          status: todo.completed ? 'completed' : 'pending',
          creationDate: todo.created_at,
          completionDate: todo.completion_date,
          category: 'daily'
        }));

        dispatch(updateTodos(formattedTodos));
        setError(null);
      } catch (err) {
        console.error('Error fetching todos:', err);
        setError('タスクの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [dispatch, authToken]);

  useEffect(() => {
    setSortedTodos(todos);
  }, [todos]);

  const moveTodo = (dragIndex: number, hoverIndex: number) => {
    const updatedTodos = [...sortedTodos];
    const [movedTodo] = updatedTodos.splice(dragIndex, 1);
    updatedTodos.splice(hoverIndex, 0, movedTodo);
    setSortedTodos(updatedTodos);
    dispatch(updateTodos(updatedTodos));
  };

  if (loading) {
    return <div className="text-center p-4 text-white">読み込み中...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-300">{error}</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      {sortedTodos.length === 0 ? (
        <div className="text-center p-4 text-gray-300">タスクがありません。新しいタスクを追加してください。</div>
      ) : (
        <ul>
          {sortedTodos.map((todo, index) => (
            <TodoItem key={todo.id} todo={todo} index={index} moveTodo={moveTodo} />
          ))}
        </ul>
      )}
    </DndProvider>
  );
};

export default TodoList;