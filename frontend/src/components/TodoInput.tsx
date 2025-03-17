// TodoInput.tsx
import React, { useState } from 'react';
import TodoEdit from './TodoEdit';

const TodoInput: React.FC = () => {
  const [isEditOpen, setEditOpen] = useState(false);

  const handleAddClick = () => {
    setEditOpen(true);
  };

  return (
    <>
      <button onClick={handleAddClick} className="bg-blue-600 text-white py-2 px-4 rounded text-sm">タスク追加</button>
      {isEditOpen && <TodoEdit addMode={true} todo={null} isOpen={isEditOpen} onClose={() => setEditOpen(false)} />}
    </>
  );
};

export default TodoInput;