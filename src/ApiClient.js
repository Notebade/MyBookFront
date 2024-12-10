import axios from 'axios';
console.log(import.meta.env.API_URL);

const userData = localStorage.getItem('userData');
const user = userData ? JSON.parse(userData) : null;

const apiClient = axios.create({
  baseURL: 'http://89.19.44.166:8000',//http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцепторы запросов
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
