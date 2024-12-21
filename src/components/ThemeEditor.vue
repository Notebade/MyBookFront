<template>
  <div>
    <h1>Темы по материалу: {{ subjectName }}</h1>
    <button @click="addNewTheme" class="btn add-btn">➕ Добавить новую тему</button>
    <div v-if="themes.length" class="themes-list">
      <ThemeNode
        v-for="theme in rootThemes"
        :key="theme.id"
        :theme="theme"
        :all-themes="themes"
        @refresh="loadThemes"
      />
    </div>
    <div v-else>
      <p>Темы отсутствуют. Добавьте первую тему!</p>
    </div>
    <!-- Новая тема -->
    <div v-if="newThemeVisible" class="new-theme-form">
      <input 
        type="number" 
        v-model="newTheme.position" 
        placeholder="Позиция" 
        class="new-theme-input" 
      />
      <input 
        type="text" 
        v-model="newTheme.name" 
        placeholder="Название" 
        class="new-theme-input" 
      />
      <button @click="saveNewTheme" class="btn save-btn">💾 Сохранить</button>
      <button @click="cancelNewTheme" class="btn cancel-btn">✖ Отменить</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, inject } from "vue";
import ThemeNode from "./ThemeNode.vue";

export default {
  components: { ThemeNode },
  setup() {
    const params = new URLSearchParams(window.location.search);
    const subjectName = ref("");
    var lastPosition = 1;
    const subjectId = params.get('subjects');
    const themes = ref([]);
    const rootThemes = ref([]);
    const newTheme = ref({ position: lastPosition, name: "", subject: {id: subjectId} });
    const newThemeVisible = ref(false);
    const apiClient = inject("apiClient");

    const loadThemes = async () => {
      try {
        const subjectResponse = await apiClient.get(`/subject/${subjectId}`);
        const position = await apiClient.post(`/theme/lastPosition`, {
          subjectId: subjectId
        });
        lastPosition = position.data;
        subjectName.value = subjectResponse.data.name;
        const themesResponse = await apiClient.post("/list/themes", {
          subjectsId: subjectId,
        });
        themes.value = themesResponse.data;
        rootThemes.value = themes.value.filter((theme) => theme.parent === null);
      } catch (error) {
        console.error("Ошибка при загрузке тем:", error);
      }
    };

    const createRootTheme = () => {
      localStorage.setItem("parentThemeId", null);
      window.location.href = "/create-theme";
    };

    const addNewTheme = () => {
      newTheme.value = { 
        position: lastPosition, 
        code: Math.random().toString(36).substring(2, 12),
        name: "", 
        subject: {id: subjectId} 
      };
      newThemeVisible.value = true;
    };

    const saveNewTheme = async () => {
      try {
        if (!newTheme.value.position || !newTheme.value.name.trim()) {
          alert("Пожалуйста, заполните все поля.");
          return;
        }
        console.log(newTheme.value);
        const response = await apiClient.post("/theme", newTheme.value);
        themes.value.push(response.data);
        rootThemes.value.push(response.data);
        newThemeVisible.value = false;
        newTheme.value = { position: lastPosition, name: "", subject: {id: subjectId} };
      } catch (error) {
        console.error("Ошибка при добавлении темы:", error);
      }
    };

    const cancelNewTheme = () => {
      newThemeVisible.value = false;
    };

    onMounted(loadThemes);

    return {
      lastPosition,
      subjectName,
      themes,
      rootThemes,
      newTheme,
      newThemeVisible,
      loadThemes,
      createRootTheme,
      addNewTheme,
      saveNewTheme,
      cancelNewTheme,
    };
  },
};
</script>