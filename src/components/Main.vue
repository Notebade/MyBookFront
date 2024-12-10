<script>
export default {
  name: "Main",
};
</script>

<template>
  <header class="header">
    <div class="logo">
      <h1>My App</h1>
    </div>
    <nav>
      <ul class="menu">
        <li><router-link to="/discipline">Дисциплины</router-link></li>
        <li><router-link to="/subject">Предметы</router-link></li>
        <li><router-link to="/test">Тесты</router-link></li>
        <li><router-link to="/practics">Практические</router-link></li>
        <li><router-link to="/user">Профиль</router-link></li>
      </ul>
    </nav>
  </header>
</template>

<style scoped>
/* Основной стиль для хедера */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: #007bff;
  color: white;
}

/* Логотип */
.logo h1 {
  margin: 0;
  font-size: 24px;
}

/* Стили для навигации */
nav {
  font-size: 18px;
}

/* Стили для меню */
.menu {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
}

/* Стили для пунктов меню */
.menu li {
  margin: 0 15px;
}

/* Стили для ссылок */
.menu a {
  color: white;
  text-decoration: none;
}

.menu a:hover {
  text-decoration: underline;
}
</style>
