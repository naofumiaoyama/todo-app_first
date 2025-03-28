import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RootState } from '../app/store';
import TodoItem from './TodoItem';
import { updateTodos } from '../features/todos/todoSlice';
import { Todo } from '../features/todos/Todo';

// 一時的に直接APIからデータを取得
const API_URL = 'http://localhost:8000';

// モックデータ（接続できない場合のフォールバック）
const MOCK_TODOS: Todo[] = [
  {
    id: 1,
    title: "買い物リストを作成する",
    description: "週末の買い物のためのリストを作成する。牛乳、卵、パン、果物を忘れないように。",
    completed: true,
    dueDate: null,
    priority: 'medium',
    status: 'completed',
    creationDate: new Date(),
    completionDate: null,
    category: 'general',
  },
  {
    id: 2,
    title: "プロジェクト計画書を作成",
    description: "新しいプロジェクトの計画書を作成し、チームメンバーに共有する。",
    completed: false,
    dueDate: null,
    priority: 'high',
    status: 'pending',
    creationDate: new Date(),
    completionDate: null,
    category: 'general',
  },
  {
    id: 3,
    title: "ジムに行く",
    description: "週3回はジムに行く習慣をつける。有酸素運動とウェイトトレーニングをバランスよく。",
    completed: false,
    dueDate: null,
    priority: 'medium',
    status: 'pending',
    creationDate: new Date(),
    completionDate: null,
    category: 'general',
  }
];

const TodoList: React.FC = () => {
  const dispatch = useDispatch();
  const todos = useSelector((state: RootState) => state.todos.todos);
  const [sortedTodos, setSortedTodos] = useState(todos);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);
  const authToken = localStorage.getItem('authToken'); // 認証トークンを取得

  // APIから直接データを取得
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        console.log('Fetching todos from API...');
        
        // 認証トークンがない場合はモックデータを使用
        if (!authToken) {
          setUseMockData(true);
          dispatch(updateTodos(MOCK_TODOS.map(todo => ({
            ...todo,
            category: '日常'
          }))));
          setLoading(false);
          return;
        }

        // Todoデータの取得（認証トークン付き）
        const response = await fetch(`${API_URL}/api/todos`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          credentials: 'include'
        });

        console.log('API Response status:', response.status);
        
        if (response.status === 401) {
          // 認証エラーの場合
          localStorage.removeItem('authToken');
          localStorage.removeItem('username');
          window.location.reload(); // ページをリロードしてログイン画面に戻る
          return;
        }

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Response error text:', errorText);
          throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Received data from API:', data);
        
        if (!Array.isArray(data)) {
          console.error('Unexpected data format, expected array:', data);
          setError('サーバーから予期しないデータ形式を受信しました。');
          setLoading(false);
          return;
        }
        
        // バックエンドのTodoをフロントエンドのTodo形式に変換
        const formattedTodos: Todo[] = data.map((todo: any) => ({
          id: todo.id,
          title: todo.title,
          description: todo.description || '',
          completed: todo.completed,
          dueDate: null,
          priority: todo.priority === 1 ? 'low' : todo.priority === 2 ? 'medium' : 'high',
          status: todo.completed ? 'completed' : 'pending',
          creationDate: new Date(todo.created_at),
          completionDate: null,
          category: '日常',
        }));

        console.log('Formatted todos:', formattedTodos);
        dispatch(updateTodos(formattedTodos));
        setError(null);
      } catch (err) {
        console.error('Error fetching todos:', err);
        setUseMockData(true);
        dispatch(updateTodos(MOCK_TODOS.map(todo => ({
          ...todo,
          category: '日常'
        }))));
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [dispatch, useMockData, authToken]); // authTokenを依存配列に追加

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

  if (error && !useMockData) {
    return <div className="text-center p-4 text-red-300">{error}</div>;
  }

  return (
    <DndProvider backend={HTML5Backend}>
      {useMockData && (
        <div className="bg-yellow-800 text-white p-2 mb-4 rounded text-sm">
          バックエンドへの接続に失敗したため、モックデータを表示しています
        </div>
      )}
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