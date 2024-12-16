<template>
    <div class="container">
      <h1>Темы</h1>
      <ul>
        <li v-for="theme in themes" :key="theme.id" class="theme-item">
          <router-link :to="`/theme/${theme.id}`" class="theme-link">
            <h2>{{ theme.name }}</h2>
          </router-link>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import { inject, ref, onMounted } from 'vue';
  
  export default {
    setup() {
      const themes = ref([]); // Массив для хранения полученных тем
  
      onMounted(async () => {
        try {
          const apiClient = inject("apiClient");
          const url = window.location.href;
          const id = url.split("/").pop(); // Получаем последний сегмент URL
  
          // Получаем данные с сервера
          const response = await apiClient.post('/list/themes', {
            subjectsId: id, // Параметр для поиска по id темы
          });
          themes.value = response.data; // Сохраняем данные в состояние
        } catch (error) {
          console.error('Ошибка при получении тем:', error);
        }
      });
  
      return {
        themes,
      };
    },
  };
  </script>
  
  <style scoped>
  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background-color: #f0f0f0; /* Добавить фон страницы, если нужно */
  }
  
  h1 {
    font-size: 2rem;
    margin-bottom: 20px;
  }
  
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
    width: 100%;
    max-width: 800px;
  }
  
  .theme-item {
    background-color: rgba(0, 123, 255, 0.4);
    border: 2px solid #007bff;
    border-radius: 15px;
    padding: 15px;
    margin: 10px 0;
    text-align: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .theme-item h2 {
    margin: 0;
    font-size: 1.5rem;
    color: #007bff;
  }
  
  .theme-link {
    text-decoration: none;
    color: inherit; /* Сохраняем цвет текста при наведении */
  }
  
  .theme-link:hover h2 {
    text-decoration: underline;
    color: #0056b3; /* Изменение цвета при наведении */
  }
  </style>
  