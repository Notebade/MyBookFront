import { createApp } from "vue";
import App from "@/App.vue";
import { createRouter, createWebHistory } from "vue-router"; // Для Vue 3
import Main from "@/components/Main.vue";
import Login from "@/components/Login.vue";

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
];

// Создаем экземпляр маршрутизатора
const router = createRouter({
  history: createWebHistory(), // Включаем режим "history" для красивых URL
  routes,
});

// Создаем и монтируем приложение
const app = createApp(App);
app.use(router); // Подключаем маршрутизатор
app.mount("#app");