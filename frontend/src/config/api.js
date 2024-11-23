export const API_BASE_URL = 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
    me: '/auth/me'
  },
  lists: {
    getAll: '/lists',
    create: '/lists',
    update: (id) => `/lists/${id}`,
    delete: (id) => `/lists/${id}`,
  },
  items: {
    create: (listId) => `/lists/${listId}/items`,
    update: (id) => `/items/${id}`,
    delete: (id) => `/items/${id}`,
  }
}; 