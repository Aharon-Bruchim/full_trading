import apiClient from './client';

export const authApi = {
  login: async (password: string): Promise<{ token: string }> => {
    const response = await apiClient.post('/api/auth/login', { password });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/auth/logout');
  },
};
