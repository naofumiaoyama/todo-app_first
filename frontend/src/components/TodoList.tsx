import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RootState } from '../app/store';
import TodoItem from './TodoItem';
import { updateTodos } from '../features/todos/todoSlice';
import { Todo } from '../features/todos/Todo';

// 一時的に直接APIからデータを取得
const API_URL = 'http://localhost:8000/api';

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

  // APIから直接データを取得
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        setLoading(true);
        console.log('Fetching todos from API...');
        
        // まずAPIサーバーの接続確認
        try {
          const healthResponse = await fetch('http://localhost:8000/', {
            mode: 'no-cors' // CORSを無効にする
          });
          console.log('API Health check:', healthResponse.ok ? 'OK' : 'Failed', healthResponse.status);
        } catch (healthErr) {
          console.error('API Health check failed:', healthErr);
          // API接続に失敗した場合はモックデータを使用
          console.log('Using mock data instead');
          setUseMockData(true);
          dispatch(updateTodos(MOCK_TODOS));
          setLoading(false);
          return;
        }
        
        // Todoデータの取得
        const response = await fetch(`${API_URL}/todos`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log('API Response status:', response.status);
        
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
        const formattedTodos: Todo[] = data.map((todo: any) => {
          console.log('Processing todo item:', todo);
          return {
            id: todo.id,
            title: todo.title,
            description: todo.description || '',
            completed: todo.completed,
            dueDate: null, // バックエンドにはないフィールド
            priority: todo.priority === 1 ? 'low' : todo.priority === 2 ? 'medium' : 'high',
            status: todo.completed ? 'completed' : 'pending',
            creationDate: new Date(todo.created_at),
            completionDate: null,
            category: 'general',
          };
        });

        console.log('Formatted todos:', formattedTodos);
        dispatch(updateTodos(formattedTodos));
        setError(null);
      } catch (err) {
        console.error('Error fetching todos:', err);
        // エラーが発生した場合はモックデータを使用
        if (!useMockData) {
          console.log('Using mock data due to error');
          setUseMockData(true);
          dispatch(updateTodos(MOCK_TODOS));
        } else {
          setError('タスクの取得中にエラーが発生しました。');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTodos();
  }, [dispatch, useMockData]);

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