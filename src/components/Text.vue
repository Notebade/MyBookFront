<template>
  <button class="btn navigate-btn" :onclick="navigateBack">
    Назад
  </button>
  <div class="content" v-if="theme && theme.text && theme.text.length">
    <div v-for="block in theme.text" :key="block.id" class="text-block">
      <p>{{ block.text }}</p>
      <div v-if="block.media && block.media.length" class="media-block">
        <img v-for="(mediaItem, index) in block.media" :key="index" :src="mediaItem.path"
          :alt="mediaItem.description || 'media'" />
      </div>
    </div>
  </div>
  <div v-else class="loading">Загрузка...</div>
</template>

<script>
import { ref, onMounted, inject } from "vue";

export default {
  name: "Text",
  setup() {
    const theme = ref(null);

    onMounted(async () => {
      try {
        const apiClient = inject("apiClient");
        if (!apiClient) throw new Error("API Client не найден!");

        const url = window.location.href;
        const id = url.split("/").pop(); // Получаем последний сегмент URL

        // Получаем данные с сервера
        const response = await apiClient.get(`/theme/${id}`);
        theme.value = response.data;
      } catch (error) {
        console.error("Ошибка при получении данных темы:", error);
      }
    });


    const navigateBack = () => {
      if (theme.value && theme.value.subjectId) {
        location.href = `/subject/${theme.value.subjectId}`;
      } else {
        console.error("subjectId отсутствует!");
      }
    };

    return {
      theme,
      navigateBack,
    };
  },
};
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.text-block {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.media-block {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.media-block img {
  max-width: 100%;
  height: auto;
  border-radius: 5px;
}

.loading {
  text-align: center;
  font-size: 1.2em;
  color: #555;
}
</style>