<template>
  <div id="app">
    <Navigation />
    <router-view />
  </div>
</template>

<script>
import Navigation from "./components/Navigation.vue";
import { provide } from "vue";

export default {
  name: "App",
  components: {
    Navigation,
  },
  setup() {
    const user = { rights: [{ code: "admin" }] }; // Пример текущего пользователя
    provide("user", user); // Передаем данные пользователя через provide/inject
  },
};
</script>