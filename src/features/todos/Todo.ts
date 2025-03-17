// src/features/todos/Todo.ts
export interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string | null;  // 締め切り日
  priority: 'low' | 'medium' | 'high';  // 優先度
  status: 'pending' | 'in-progress' | 'completed';  // ステータス
  creationDate: Date;  // 作成日
  completionDate: Date | null;  // 完了日
  category: '仕事' | '日常' | '特別';  // カテゴリ
}
