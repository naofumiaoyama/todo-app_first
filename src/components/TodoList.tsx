import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { RootState } from '../app/store';
import TodoItem from './TodoItem';
import { updateTodos } from '../features/todos/todoSlice';

const TodoList: React.FC = () => {
  const dispatch = useDispatch();
  const todos = useSelector((state: RootState) => state.todos.todos);
  const [sortedTodos, setSortedTodos] = useState(todos);

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

  return (
    <DndProvider backend={HTML5Backend}>
      <ul>
        {sortedTodos.map((todo, index) => (
          <TodoItem key={todo.id} todo={todo} index={index} moveTodo={moveTodo} />
        ))}
      </ul>
    </DndProvider>
  );
};

export default TodoList;
