import { createApp } from "vue";
import App from "@/App.vue";
import { createRouter, createWebHistory } from "vue-router"; // Для Vue 3
import Main from "@/components/Main.vue";
import Login from "@/components/Login.vue";
import User from "@/components/User.vue";
import Registration from "@/components/Registration.vue";
import Discipline from "@/components/Discipline.vue";
import DisciplineEditor from "@/components/DisciplineEditor.vue";
import SubjectEditor from "@/components/SubjectEditor.vue";
import Subject from "@/components/Subject.vue";
import Theme from "@/components/Theme.vue";
import ThemeEditor from "@/components/ThemeEditor.vue";
import ThemeNode from "@/components/ThemeNode.vue";
import Text from "@/components/Text.vue";
import Test from "@/components/Test.vue";
import TestViev from "@/components/TestViev.vue";
import TestEditor from "@/components/TestEditor.vue";
import Admin from "@/components/Admin.vue";
import Navigation from '@/components/Navigation.vue';
import apiClient from '@/ApiClient.js';

const userData = localStorage.getItem('userData');
const user = userData ? JSON.parse(userData) : null;
if (user?.login == null && window.location.pathname !== '/login' && window.location.pathname !== '/registration') {
  window.location.replace('/login');
}

if(user != null) {
  try {
  const res = await apiClient.post("/user/auth/check", {
    token: user.token
  });
  if (res.status === 200) {
    localStorage.setItem('userData', JSON.stringify(res.data, null, 2));
  }
} catch (err) {
  localStorage.setItem('userData', null);
  window.location.replace('/login')
}
}


// Определяем маршруты
const routes = [
  {
    path: "/",
    component: Main,
    name: 'Главная',
    meta: { showInNav: true },
  },
  {
    path: "/login",
    component: Login,
  },
  {
    path: "/test",
    component: Test,
    name: 'Тесты',
    meta: { showInNav: true },
  },
  {
    path: "/test/:id",
    component: TestViev,
  },
  {
    path: "/user",
    component: User,
    name: 'Пользователь',
    meta: { showInNav: true },
  },
  {
    path: "/registration",
    component: Registration,
  },
  {
    path: "/discipline",
    component: Discipline,
    name: 'Дисциплины',
    meta: { showInNav: true },
  },
  {
    path: "/discipline/:id",
    component: Subject,
  },
  {
    path: "/subject/:id",
    component: Theme,
  },
  {
    path: "/theme/:id",
    component: Text,
  },
];
let hasRequiredRights = false
if(user != null) {
  hasRequiredRights = user.rights.some(right => ['admin', 'teacher'].includes(right.code));
}

if(hasRequiredRights) {
  routes.push(
    {
      path: "/theme/editor",
      component: ThemeEditor,
    },
    {
      path: "/subject/editor",
      component: SubjectEditor,
    },
    {
      path: "/subject/editor/:id",
      component: SubjectEditor,
    },
    {
      path: "/discipline/editor",
      component: DisciplineEditor,
    },
    {
      path: "/discipline/editor/:id",
      component: DisciplineEditor,
    },
    {
      path: "/test/editor/:id",
      component: TestEditor,
    },
    {
      path: "/test/editor/",
      component: TestEditor,
    },
  );
}
let hashAdmin = false
if(user != null) {
  const hashAdmin = user.rights.some(right => ['admin'].includes(right.code));
}

if(hasRequiredRights) {
  routes.push(
    {
      path: "/admin",
      component: Admin,
    },
  );
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