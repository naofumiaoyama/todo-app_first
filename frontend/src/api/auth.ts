import { API_BASE_URL } from '../config/api';

export interface LoginResponse {
  access_token: string;
  token_type: 'bearer';
}

export const login = async (username: string, password: string): Promise<LoginResponse> => {
  const formData = new URLSearchParams();
  formData.append('grant_type', '');
  formData.append('username', username);
  formData.append('password', password);
  formData.append('scope', '');
  formData.append('client_id', '');
  formData.append('client_secret', '');

  const response = await fetch(`${API_BASE_URL}/token`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('ユーザー名またはパスワードが間違っています');
    }
    throw new Error('ログインに失敗しました');
  }

  return response.json();
}; 