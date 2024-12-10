<template>
  <header class="header">
    <div class="logo">
      <h1>My App</h1>
    </div>
    <nav>
      <ul class="menu">
        <li><router-link to="/">Главная</router-link></li>
        <li><router-link to="/subject">Предметы</router-link></li>
        <li><router-link to="/test">Тесты</router-link></li>
        <li><router-link to="/practics">Практические</router-link></li>
        <li><router-link to="/user">Профиль</router-link></li>
      </ul>
    </nav>
  </header>
  <div class="cards-container">
    <!-- Итерация по данным из API -->
    <div v-for="item in apiData" :key="item.id" class="card">
      <div class="card-header">
        <h3>{{ item.name }}</h3>
        <p><strong>Code:</strong> {{ item.code }}</p>
      </div>
      <div class="card-body">
        <p><strong>Description:</strong> {{ item.description }}</p>
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
        // Отправляем GET-запрос
        const res = await apiClient.get("/list/disciplines");
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
