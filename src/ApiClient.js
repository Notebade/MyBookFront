import axios from 'axios';
const userData = localStorage.getItem('userData');
const user = userData ? JSON.parse(userData) : null;

const apiClient = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцепторы запросов
apiClient.interceptors.request.use(
  (config) => {
    const userData = localStorage.getItem('userData');
    const user = userData ? JSON.parse(userData) : null;
    if (user?.token) {
      config.headers.Authorization = `Bearer ${user?.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Интерцепторы ответов
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response);
    return Promise.reject(error);
  }
);

export default apiClient;
