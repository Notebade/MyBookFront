import { createApp } from "vue";
import App from "@/App.vue";
import { createRouter, createWebHistory } from "vue-router"; // Для Vue 3
import Main from "@/components/Main.vue";
import Login from "@/components/Login.vue";
import Discipline from "@/components/Discipline.vue";
import DisciplineEditor from "@/components/DisciplineEditor.vue";
import apiClient from '@/ApiClient.js';
import "@/Main.css";

// Определяем маршруты
const routes = [
  {
    path: "/",
    component: Main,
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/discipline",
    component: Discipline,
  },
  {
    path: "/discipline/editor",
    component: DisciplineEditor,
  },
  {
    path: "/discipline/editor/:id",
    component: DisciplineEditor,
  }
];

const userData = localStorage.getItem('userData');
const user = userData ? JSON.parse(userData) : null;
if (user?.login == null && window.location.pathname !== '/login') {
  window.location.replace('/login');
}


// Создаем экземпляр маршрутизатора
const router = createRouter({
  history: createWebHistory(), // Включаем режим "history" для красивых URL
  routes,
});

// Создаем и монтируем приложение
const app = createApp(App);
app.provide("apiClient", apiClient);
app.use(router); // Подключаем маршрутизатор
app.mount("#app");