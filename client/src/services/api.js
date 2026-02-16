import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { getToken, removeToken } from '../utils/localStorage';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor - add token to headers
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (username, password) =>
  api.post('/auth/register', { username, password }).then((res) => res.data);

export const loginUser = (username, password) =>
  api.post('/auth/login', { username, password }).then((res) => res.data);

export const getCurrentUser = () =>
  api.get('/auth/me').then((res) => res.data);

// Lists
export const getLists = () =>
  api.get('/lists').then((res) => res.data);

export const createList = (name) =>
  api.post('/lists', { name }).then((res) => res.data);

export const updateList = (id, name) =>
  api.put(`/lists/${id}`, { name }).then((res) => res.data);

export const deleteList = (id) =>
  api.delete(`/lists/${id}`);

// Tasks
export const getTasks = (listId) =>
  api.get(`/lists/${listId}/tasks`).then((res) => res.data);

export const getImportantTasks = () =>
  api.get('/tasks/important').then((res) => res.data);

export const createTask = (listId, title) =>
  api.post(`/lists/${listId}/tasks`, { title }).then((res) => res.data);

export const updateTask = (id, updates) =>
  api.patch(`/tasks/${id}`, updates).then((res) => res.data);

export const deleteTask = (id) =>
  api.delete(`/tasks/${id}`);

export const reorderTasks = (listId, taskOrders) =>
  api.patch(`/lists/${listId}/tasks/reorder`, { taskOrders });
