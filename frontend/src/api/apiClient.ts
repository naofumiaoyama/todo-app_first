export const createAuthenticatedRequest = (token: string) => {
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

export const handleApiError = (error: unknown) => {
  if (error instanceof Response) {
    if (error.status === 401) {
      // トークンが無効な場合はログアウト
      localStorage.removeItem('authToken');
      localStorage.removeItem('username');
      window.location.reload();
    }
  }
  throw error;
}; 