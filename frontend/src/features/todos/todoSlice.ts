import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Todo } from './Todo';
import { todoAPI } from '../../services/api';

interface TodosState {
  todos: Todo[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: TodosState = {
  todos: [],
  status: 'idle',
  error: null,
};

// Async thunks
export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  try {
    return await todoAPI.getAllTodos();
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
});

export const addTodoAsync = createAsyncThunk(
  'todos/addTodoAsync',
  async (todoData: { title: string; description: string; priority?: 'low' | 'medium' | 'high' }) => {
    const response = await todoAPI.createTodo(todoData);
    return response;
  }
);

export const updateTodoAsync = createAsyncThunk(
  'todos/updateTodoAsync',
  async ({ id, todoData }: { id: number; todoData: Partial<Todo> }) => {
    const response = await todoAPI.updateTodo(id, todoData);
    return response;
  }
);

export const deleteTodoAsync = createAsyncThunk(
  'todos/deleteTodoAsync',
  async (id: number) => {
    await todoAPI.deleteTodo(id);
    return id;
  }
);

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<{ 
      title: string; 
      description: string; 
      dueDate?: string | null;
      priority?: 'low' | 'medium' | 'high';
      category?: 'daily' | 'work' | 'special';
      completed?: boolean;
    }>) => {
      const newTodo: Todo = {
        id: Date.now(),
        title: action.payload.title,
        description: action.payload.description,
        completed: action.payload.completed || false,
        dueDate: action.payload.dueDate || null,
        priority: action.payload.priority || 'medium',
        status: 'pending',
        creationDate: new Date().toISOString(),
        completionDate: null,
        category: action.payload.category || 'daily',
      };
      state.todos.push(newTodo);
    },    
    toggleTodo: (state, action: PayloadAction<Todo>) => {
      const index = state.todos.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.todos[index] = action.payload;  // 完全なTodoオブジェクトで更新
      }
    },
    removeTodo: (state, action: PayloadAction<number>) => {
      state.todos = state.todos.filter((todo) => todo.id !== action.payload);
    },
    updateTodo: (state, action: PayloadAction<Todo>) => {
      const index = state.todos.findIndex((todo) => todo.id === action.payload.id);
      if (index !== -1) {
        state.todos[index] = action.payload;
      }
    },
    updateTodos: (state, action: PayloadAction<Todo[]>) => {
      state.todos = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchTodos
      .addCase(fetchTodos.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.todos = action.payload;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch todos';
      })
      
      // addTodoAsync
      .addCase(addTodoAsync.fulfilled, (state, action) => {
        // APIからの応答をTodo型に変換
        const newTodo: Todo = {
          id: action.payload.id,
          title: action.payload.title,
          description: action.payload.description || '',
          completed: action.payload.completed,
          dueDate: null,
          priority: action.payload.priority === 1 ? 'low' : action.payload.priority === 3 ? 'high' : 'medium',
          status: action.payload.completed ? 'completed' : 'pending',
          creationDate: new Date(action.payload.created_at),
          completionDate: null,
          category: 'general',
        };
        state.todos.push(newTodo);
      })
      
      // updateTodoAsync
      .addCase(updateTodoAsync.fulfilled, (state, action) => {
        const index = state.todos.findIndex((todo) => todo.id === action.payload.id);
        if (index !== -1) {
          // 既存のTodoと新しいデータをマージ
          state.todos[index] = {
            ...state.todos[index],
            title: action.payload.title,
            description: action.payload.description || state.todos[index].description,
            completed: action.payload.completed,
            priority: action.payload.priority === 1 ? 'low' : action.payload.priority === 3 ? 'high' : 'medium',
            status: action.payload.completed ? 'completed' : 'pending',
          };
        }
      })
      
      // deleteTodoAsync
      .addCase(deleteTodoAsync.fulfilled, (state, action) => {
        state.todos = state.todos.filter((todo) => todo.id !== action.payload);
      });
  },
});

export const { addTodo, toggleTodo, removeTodo, updateTodo, updateTodos } = todoSlice.actions;
export default todoSlice.reducer;
