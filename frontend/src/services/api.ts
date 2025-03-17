// src/services/api.ts

// APIのベースURL
const API_URL = 'http://localhost:8000/api';

// 開発用の固定トークン（有効期限: 2025-01-01）
const DEV_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsImV4cCI6MTc0MDM0NTIwMH0.YpP9jcmLxzZMVh95x8nrjtrBnMGU9NqVCXISr--wPbU";

// Todo関連のAPI
export const todoAPI = {
  // すべてのTodoを取得
  getAllTodos: async () => {
    try {
      const response = await fetch(`${API_URL}/todos`, {
        headers: {
          'Authorization': `Bearer ${DEV_TOKEN}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Get todos error:', error);
      throw error;
    }
  },

  // 新しいTodoを作成
  createTodo: async (todoData: { title: string; description: string; priority?: 'low' | 'medium' | 'high' }) => {
    try {
      // フロントエンドの優先度をバックエンドの優先度に変換
      const priorityValue = 
        todoData.priority === 'low' ? 1 : 
        todoData.priority === 'high' ? 3 : 2;
      
      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEV_TOKEN}`
        },
        body: JSON.stringify({
          title: todoData.title,
          description: todoData.description,
          priority: priorityValue
        })
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create todo error:', error);
      throw error;
    }
  },

  // Todoを更新
  updateTodo: async (id: number, todoData: any) => {
    try {
      // フロントエンドの優先度をバックエンドの優先度に変換
      let priorityValue = undefined;
      if (todoData.priority) {
        priorityValue = 
          todoData.priority === 'low' ? 1 : 
          todoData.priority === 'high' ? 3 : 2;
      }
      
      const dataToSend: any = {};
      if (todoData.title !== undefined) dataToSend.title = todoData.title;
      if (todoData.description !== undefined) dataToSend.description = todoData.description;
      if (todoData.completed !== undefined) dataToSend.completed = todoData.completed;
      if (priorityValue !== undefined) dataToSend.priority = priorityValue;
      
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEV_TOKEN}`
        },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Update todo ${id} error:`, error);
      throw error;
    }
  },

  // Todoを削除
  deleteTodo: async (id: number) => {
    try {
      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${DEV_TOKEN}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error(`Delete todo ${id} error:`, error);
      throw error;
    }
  },
};