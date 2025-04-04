// src/features/todos/Todo.ts
export interface Todo {
  id: number | string;  // 数値型と文字列型の両方を受け付ける
  title: string;
  description: string;
  completed: boolean;
  dueDate: string | null;  // 締め切り日
  priority: 'low' | 'medium' | 'high';  // 優先度
  status: 'pending' | 'completed';
  creationDate: string;  // Date から string に変更
  completionDate: string | null;  // Date から string に変更
  category: 'work' | 'daily' | 'special';
}
