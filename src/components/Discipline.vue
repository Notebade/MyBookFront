<template>
  <header class="header">
    <div class="logo">
      <h1>My App</h1>
    </div>
    <nav>
      <ul class="menu">
        <li><router-link to="/">Главная</router-link></li>
        <li><router-link to="/test">Тесты</router-link></li>
        <li><router-link to="/practics">Практические</router-link></li>
        <li><router-link to="/user">Профиль</router-link></li>
      </ul>
    </nav>
  </header>
  <button 
      class="btn navigate-btn" 
      :onclick="`location.href='/discipline/editor'`">
      Создать
    </button>
  <div class="cards-container">
    <!-- Итерация по данным из API -->
    <div 
  v-for="item in apiData" 
  :key="item.id" 
  class="card" 
  :title="item.description">
  
  <div class="card-header">
    <h3>{{ item.name }}</h3>
    <!--<p><strong>Code:</strong> {{ item.code }}</p>-->
  </div>
  
  <div class="card-body">
    <div class="authors">
      <p><strong>Authors:</strong></p>
      <ul>
        <li v-for="author in item.authors" :key="author.id">
          {{ author.fullName }}
        </li>
      </ul>
    </div>
    <!-- Проверка наличия изображения и отображение -->
    <div v-if="item.media">
      <img :src="item.media.path" alt="media" class="media-image" />
    </div>
  </div>

  <!-- Блок кнопок -->
  <div class="card-footer">
    <button 
      class="btn edit-btn" 
      :onclick="`location.href='/discipline/editor/${item.id}'`">
      Редактировать
    </button>
    <button 
      class="btn navigate-btn" 
      :onclick="`location.href='/discipline/${item.id}'`">
      Перейти
    </button>
  </div>
</div>

  </div>
</template>

<script>

import { inject, ref, onMounted } from 'vue';

export default {
  setup() {
    const apiClient = inject("apiClient");
    const apiData = ref([]);  // Используем ref для реактивных данных

    const fetchData = async () => {
      try {
        const res = await apiClient.post("/list/disciplines");
        if (res.status === 200) {
          apiData.value = res.data; // Сохраняем данные в apiData
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    onMounted(() => {
      fetchData(); // Получаем данные при монтировании компонента
    });

    return {
      apiData,
    };
  },
};
</script>

<style scoped>
.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
  background-color: rgba(0, 123, 255, 0.4);
  padding-top: 5vh;
  padding-left: 1vw;
  padding-right: 1vw;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 15px;
  display: flex;
  flex-direction: column;
}
a.card {
  text-decoration: inherit; /* Убирает подчеркивание */
  color: inherit; /* Наследует цвет текста от родителя */
  display: inherit; /* Делает ссылку блочной, как div */
  cursor: crosshair; /* Добавляет указатель при наведении */
}

a.card:hover {
   background-color: rgba(0, 123, 255, 0.6);
   cursor: pointer /* Добавляет указатель при наведении */
}

.card-header {
  margin-bottom: 10px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.authors ul {
  list-style: none;
  padding-left: 0;
}

.authors li {
  margin: 5px 0;
}

.media-image {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: #007bff;
  color: white;
  border: 1px solid #ccc;
  border-radius: 8px;
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
