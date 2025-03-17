import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Todo } from './Todo';

interface TodosState {
  todos: Todo[];
}

const initialState: TodosState = {
  todos: [],
};

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo: (state, action: PayloadAction<{ 
      title: string; 
      description: string; 
      dueDate?:string;
      priority?: 'low' | 'medium' | 'high';
      category?: string;
    }>) => {
      const newTodo: Todo = {
        id: Date.now(),
        title: action.payload.title,
        description: action.payload.description,
        completed: false,
        dueDate: action.payload.dueDate || null,
        priority: action.payload.priority || 'medium',
        status: 'pending',
        creationDate: new Date(),
        completionDate: null,
        category: action.payload.category || 'general',
      };
      state.todos.push(newTodo);
    },    
    toggleTodo: (state, action: PayloadAction<number>) => {
      const todo = state.todos.find((todo) => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
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
});

export const { addTodo, toggleTodo, removeTodo, updateTodo, updateTodos } = todoSlice.actions;
export default todoSlice.reducer;
